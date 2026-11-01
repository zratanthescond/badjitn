"use server";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Order from "@/lib/database/models/order.model";
import Attendance from "@/lib/database/models/attendance.model";
import Organisation from "@/lib/database/models/organisation.model";
import { getCurrencyCodeByCountry } from "@/lib/utils";
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
