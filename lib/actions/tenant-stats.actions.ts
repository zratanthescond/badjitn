"use server";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Order from "@/lib/database/models/order.model";
import Attendance from "@/lib/database/models/attendance.model";
import Organisation from "@/lib/database/models/organisation.model";
import { isValidObjectId } from "mongoose";
import { getCurrencyCodeByCountry } from "@/lib/utils";
import { getEventReportData } from "./event.actions";
import { checkTenantAccess } from "./tenant.actions";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_FILL_DAYS = 400;

export type TenantStatsFilters = {
    /** YYYY-MM-DD, inclusive. Applies to the registration date (Order.createdAt). */
    from?: string;
    /** YYYY-MM-DD, inclusive. */
    to?: string;
    /** Restrict to one organisation of the tenant. */
    orgId?: string;
};

const sum = (map: Map<string, number>, key: string, value: number) =>
    map.set(key, (map.get(key) || 0) + value);

/**
 * Consolidated statistics for a tenant's back office.
 * Revenue follows getEventReportData: sum of Order.totalAmount, with a total of 0 counted as "free".
 * Revenue is never added across currencies (each event's currency comes from its country).
 */
export async function getTenantDashboardStats(tenantSlug: string, filters: TenantStatsFilters = {}) {
    const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
    await connectToDatabase();

    // Isolation: every query below is restricted to the organisations of this tenant.
    const tenantOrgs = await Organisation.find({ tenant: tenant._id }).select("name").lean<any[]>();
    const orgs = filters.orgId
        ? tenantOrgs.filter((o) => o._id.toString() === filters.orgId)
        : tenantOrgs;
    const orgName = new Map(orgs.map((o) => [o._id.toString(), o.name as string]));

    const events = await Event.find({ organisation: { $in: orgs.map((o) => o._id) } })
        .select("title organisation startDateTime country location")
        .lean<any[]>();

    const info = new Map(
        events.map((e) => [
            e._id.toString(),
            {
                id: e._id.toString(),
                title: e.title as string,
                orgId: e.organisation.toString() as string,
                startDateTime: e.startDateTime as Date,
                currency: getCurrencyCodeByCountry(e.country, e.location) as string,
            },
        ])
    );

    const dateRange: Record<string, Date> = {};
    if (filters.from && DATE_RE.test(filters.from)) dateRange.$gte = new Date(`${filters.from}T00:00:00.000Z`);
    if (filters.to && DATE_RE.test(filters.to)) dateRange.$lte = new Date(`${filters.to}T23:59:59.999Z`);

    const match: Record<string, unknown> = { event: { $in: events.map((e) => e._id) } };
    if (Object.keys(dateRange).length) match.createdAt = dateRange;

    const amount = { $ifNull: ["$totalAmount", 0] };
    const [byEvent, byDay, byType, byCategory] = events.length
        ? await Promise.all([
              Order.aggregate([
                  { $match: match },
                  {
                      $lookup: {
                          from: Attendance.collection.name,
                          localField: "_id",
                          foreignField: "order",
                          pipeline: [{ $limit: 1 }, { $project: { _id: 1 } }],
                          as: "att",
                      },
                  },
                  {
                      $group: {
                          _id: "$event",
                          orders: { $sum: 1 },
                          revenue: { $sum: amount },
                          attended: { $sum: { $cond: [{ $gt: [{ $size: "$att" }, 0] }, 1, 0] } },
                      },
                  },
              ]),
              Order.aggregate([
                  { $match: match },
                  {
                      $group: {
                          _id: {
                              event: "$event",
                              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                          },
                          orders: { $sum: 1 },
                          revenue: { $sum: amount },
                      },
                  },
              ]),
              Order.aggregate([
                  { $match: match },
                  {
                      $group: {
                          _id: {
                              event: "$event",
                              key: { $cond: [{ $eq: [amount, 0] }, "free", { $ifNull: ["$type", "paid"] }] },
                          },
                          orders: { $sum: 1 },
                      },
                  },
              ]),
              Order.aggregate([
                  { $match: match },
                  {
                      $group: {
                          _id: { event: "$event", key: { $ifNull: ["$category", "attendee"] } },
                          orders: { $sum: 1 },
                      },
                  },
              ]),
          ])
        : [[], [], [], []];

    // ---- Per event / per organisation / per currency ----
    const revenueByCurrency = new Map<string, number>();
    const ordersByCurrency = new Map<string, number>();
    const orgAgg = new Map<string, { orders: number; revenue: Map<string, number> }>();
    const eventAgg = new Map<string, { orders: number; revenue: number }>();
    let totalOrders = 0;
    let totalAttended = 0;

    for (const row of byEvent) {
        const ev = info.get(row._id.toString());
        if (!ev) continue;
        totalOrders += row.orders;
        totalAttended += row.attended;
        sum(revenueByCurrency, ev.currency, row.revenue);
        sum(ordersByCurrency, ev.currency, row.orders);
        eventAgg.set(ev.id, { orders: row.orders, revenue: row.revenue });
        const o = orgAgg.get(ev.orgId) || { orders: 0, revenue: new Map<string, number>() };
        o.orders += row.orders;
        sum(o.revenue, ev.currency, row.revenue);
        orgAgg.set(ev.orgId, o);
    }

    const eventsList = Array.from(info.values());
    const currencies = Array.from(revenueByCurrency.entries()).sort((a, b) => b[1] - a[1]);
    const primaryCurrency = currencies[0]?.[0] || eventsList[0]?.currency || "USD";

    // ---- Timeline (orders for every event, revenue only in the primary currency) ----
    const days = new Map<string, { orders: number; revenue: number }>();
    for (const row of byDay) {
        const ev = info.get(row._id.event.toString());
        if (!ev) continue;
        const d = days.get(row._id.day) || { orders: 0, revenue: 0 };
        d.orders += row.orders;
        if (ev.currency === primaryCurrency) d.revenue += row.revenue;
        days.set(row._id.day, d);
    }
    const timeline: { date: string; orders: number; revenue: number }[] = [];
    const keys = Array.from(days.keys()).sort();
    if (keys.length) {
        const start = new Date(`${keys[0]}T00:00:00.000Z`);
        const end = new Date(`${keys[keys.length - 1]}T00:00:00.000Z`);
        const span = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
        if (span <= MAX_FILL_DAYS) {
            for (let i = 0; i < span; i++) {
                const date = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
                const d = days.get(date);
                timeline.push({ date, orders: d?.orders || 0, revenue: Math.round((d?.revenue || 0) * 100) / 100 });
            }
        } else {
            for (const date of keys) {
                const d = days.get(date)!;
                timeline.push({ date, orders: d.orders, revenue: Math.round(d.revenue * 100) / 100 });
            }
        }
    }

    // ---- Breakdowns ----
    const tally = (rows: any[]) => {
        const m = new Map<string, number>();
        for (const r of rows) if (info.has(r._id.event.toString())) sum(m, r._id.key, r.orders);
        return Array.from(m.entries())
            .map(([key, orders]) => ({ key, orders }))
            .sort((a, b) => b.orders - a.orders);
    };

    const now = Date.now();
    const withStats = (e: (typeof eventsList)[number]) => ({
        id: e.id,
        title: e.title,
        organisation: orgName.get(e.orgId) || "",
        startDateTime: e.startDateTime,
        currency: e.currency,
        orders: eventAgg.get(e.id)?.orders || 0,
        revenue: eventAgg.get(e.id)?.revenue || 0,
    });

    const primaryOrders = ordersByCurrency.get(primaryCurrency) || 0;
    const primaryRevenue = revenueByCurrency.get(primaryCurrency) || 0;

    return JSON.parse(
        JSON.stringify({
            primaryCurrency,
            kpis: {
                organisations: orgs.length,
                events: eventsList.length,
                upcomingEvents: eventsList.filter((e) => new Date(e.startDateTime).getTime() >= now).length,
                pastEvents: eventsList.filter((e) => new Date(e.startDateTime).getTime() < now).length,
                orders: totalOrders,
                attended: totalAttended,
                attendanceRate: totalOrders ? (totalAttended / totalOrders) * 100 : 0,
                averageOrderValue: primaryOrders ? primaryRevenue / primaryOrders : 0,
                revenueByCurrency: currencies.map(([currency, amount]) => ({ currency, amount })),
            },
            timeline,
            byOrganisation: orgs
                .map((o) => {
                    const a = orgAgg.get(o._id.toString());
                    return {
                        id: o._id.toString(),
                        name: o.name,
                        events: eventsList.filter((e) => e.orgId === o._id.toString()).length,
                        orders: a?.orders || 0,
                        revenueByCurrency: a ? Array.from(a.revenue.entries()).map(([currency, amount]) => ({ currency, amount })) : [],
                    };
                })
                .sort((a, b) => b.orders - a.orders),
            byType: tally(byType),
            byCategory: tally(byCategory),
            topEvents: eventsList
                .map(withStats)
                .filter((e) => e.orders > 0)
                .sort((a, b) => b.orders - a.orders)
                .slice(0, 5),
            upcoming: eventsList
                .filter((e) => new Date(e.startDateTime).getTime() >= now)
                .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
                .slice(0, 5)
                .map(withStats),
            organisationOptions: tenantOrgs.map((o) => ({ id: o._id.toString(), name: o.name })),
        })
    );
}

// ==========================================
// EVENTS LIST (paginated, scoped to the tenant)
// ==========================================
export type TenantEventsFilters = {
    orgId?: string;
    status?: "all" | "upcoming" | "past";
    q?: string;
    page?: number;
};

const PAGE_SIZE = 20;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getTenantEvents(tenantSlug: string, filters: TenantEventsFilters = {}) {
    const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
    await connectToDatabase();

    const tenantOrgs = await Organisation.find({ tenant: tenant._id }).select("name").lean<any[]>();
    const scoped = filters.orgId ? tenantOrgs.filter((o) => o._id.toString() === filters.orgId) : tenantOrgs;
    const orgName = new Map(tenantOrgs.map((o) => [o._id.toString(), o.name as string]));

    const query: Record<string, any> = { organisation: { $in: scoped.map((o) => o._id) } };
    const now = new Date();
    if (filters.status === "upcoming") query.startDateTime = { $gte: now };
    if (filters.status === "past") query.startDateTime = { $lt: now };
    const q = filters.q?.trim().slice(0, 100);
    if (q) query.title = { $regex: escapeRegex(q), $options: "i" };

    // Public action: never trust the page number (NaN/Infinity would break skip()).
    const page = Number.isFinite(filters.page) ? Math.max(1, Math.floor(filters.page as number)) : 1;
    const [total, events] = await Promise.all([
        Event.countDocuments(query),
        Event.find(query)
            .select("title imageUrl organisation startDateTime endDateTime isFree country location")
            .sort({ startDateTime: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean<any[]>(),
    ]);

    const counts = events.length
        ? await Order.aggregate([
              { $match: { event: { $in: events.map((e) => e._id) } } },
              {
                  $group: {
                      _id: "$event",
                      orders: { $sum: 1 },
                      revenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
                  },
              },
          ])
        : [];
    const countMap = new Map(counts.map((c: any) => [c._id.toString(), c]));

    return JSON.parse(
        JSON.stringify({
            events: events.map((e) => ({
                id: e._id.toString(),
                title: e.title,
                imageUrl: e.imageUrl,
                organisation: orgName.get(e.organisation.toString()) || "",
                startDateTime: e.startDateTime,
                endDateTime: e.endDateTime,
                isFree: !!e.isFree,
                currency: getCurrencyCodeByCountry(e.country, e.location),
                orders: countMap.get(e._id.toString())?.orders || 0,
                revenue: countMap.get(e._id.toString())?.revenue || 0,
            })),
            total,
            page,
            pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            organisationOptions: tenantOrgs.map((o) => ({ id: o._id.toString(), name: o.name })),
        })
    );
}

// ==========================================
// EVENT DETAIL (aggregates only: no participant personal data)
// ==========================================
export async function getTenantEventDetail(tenantSlug: string, eventId: string) {
    const { tenant } = await checkTenantAccess(tenantSlug, "viewer");
    await connectToDatabase();

    if (!isValidObjectId(eventId)) return null;

    const orgs = await Organisation.find({ tenant: tenant._id }).select("name").lean<any[]>();
    // Isolation: an event outside the tenant behaves exactly like a missing one.
    const event = await Event.findOne({ _id: eventId, organisation: { $in: orgs.map((o) => o._id) } })
        .select("title imageUrl organisation startDateTime endDateTime isFree country location")
        .lean<any>();
    if (!event) return null;

    const report = await getEventReportData(eventId);
    const stats = report?.stats;
    if (!stats) return null;

    // Report trend is bucketed by 3h: fold it into days to match the dashboard chart.
    const days = new Map<string, { orders: number; revenue: number }>();
    for (const p of stats.orderTrend || []) {
        const date = String(p.date).slice(0, 10);
        const d = days.get(date) || { orders: 0, revenue: 0 };
        d.orders += p.orders;
        d.revenue += p.revenue;
        days.set(date, d);
    }
    const timeline = Array.from(days.entries())
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([date, d]) => ({ date, orders: d.orders, revenue: Math.round(d.revenue * 100) / 100 }));

    return JSON.parse(
        JSON.stringify({
            event: {
                id: event._id.toString(),
                title: event.title,
                imageUrl: event.imageUrl,
                startDateTime: event.startDateTime,
                endDateTime: event.endDateTime,
                isFree: !!event.isFree,
                organisation: orgs.find((o) => o._id.toString() === event.organisation.toString())?.name || "",
            },
            currency: getCurrencyCodeByCountry(event.country, event.location),
            stats: {
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                uniqueBuyers: stats.uniqueBuyers,
                uniqueScannedAttendees: stats.uniqueScannedAttendees,
                attendanceRate: stats.attendanceRate,
                averageOrderValue: stats.averageOrderValue,
                ordersByType: stats.ordersByType,
                ordersByCategory: stats.ordersByCategory,
                revenueByType: stats.revenueByType,
                scanActivityByHour: stats.scanActivityByHour,
                topPricePlans: (stats.topPricePlans || []).slice(0, 8).map((p: any) => ({
                    name: p.name,
                    orders: p.orders,
                    revenue: p.revenue,
                })),
            },
            scanPoints: Object.entries(report.scanPointData || {}).map(([name, v]: [string, any]) => ({
                name,
                count: v.count,
            })),
            timeline,
        })
    );
}
