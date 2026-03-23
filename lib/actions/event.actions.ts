"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import User from "@/lib/database/models/user.model";
import Category from "@/lib/database/models/category.model";
import Organisation from "@/lib/database/models/organisation.model";
import { formatPriceByCountry, handleError } from "@/lib/utils";

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from "@/types";
import { differenceInDays, isValid, parseISO } from "date-fns";
import Sponsor from "../database/models/sponor.model";
import { model } from "mongoose";
import Report from "../database/models/report.model";
import Order from "../database/models/order.model";
import Attendance from "../database/models/attendance.model";
import { json } from "stream/consumers";
import { date } from "zod";
import { start } from "repl";

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};

const populateEvent = (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select:
        "_id firstName lastName username photo clerkId",
    })
    .populate({ path: "category", model: Category, select: "_id name" })
    .populate({ path: "Sponsors", model: Sponsor, select: "_id" })
    .populate({
      path: "organisation",
      model: Organisation,
      select: "_id name slug logo description isVerified",
    });
};

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase();

    const organizer = await User.findById(userId);
    if (!organizer) throw new Error("Organizer not found");

    // Organisation is required — events are always published under an organisation
    const organisationId = event.organisationId;
    if (!organisationId) {
      throw new Error("Organisation is required to create an event");
    }

    const org = await Organisation.findById(organisationId);
    if (!org) throw new Error("Organisation not found");

    // Check if user is creator or admin of this organisation
    const isCreator = org.creator.toString() === userId;
    const isAdmin = org.admins.some(
      (adminId: any) => adminId.toString() === userId
    );

    if (!isCreator && !isAdmin) {
      throw new Error("You do not have permission to create events for this organisation");
    }

    const newEvent = await Event.create({
      ...event,
      pricePlan: event.pricePlan,
      category: event.categoryId,
      organizer: userId,
      organisation: organisationId,
      showWorkSubmissionPopup: Boolean(event.showWorkSubmissionPopup),
    });
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    handleError(error);
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase();

    const event = await populateEvent(Event.findById(eventId));

    if (!event) throw new Error("Event not found");

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase();

    const eventToUpdate = await Event.findById(event._id);
    if (!eventToUpdate) {
      throw new Error("Event not found");
    }

    // Check permission: user must be organizer OR admin/creator of the event's organisation
    const isOrganizer = eventToUpdate.organizer?.toHexString() === userId;
    let hasOrgAccess = false;

    if (eventToUpdate.organisation) {
      const org = await Organisation.findById(eventToUpdate.organisation);
      if (org) {
        const isCreator = org.creator.toString() === userId;
        const isAdmin = org.admins.some(
          (adminId: any) => adminId.toString() === userId
        );
        hasOrgAccess = isCreator || isAdmin;
      }
    }

    if (!isOrganizer && !hasOrgAccess) {
      throw new Error("Unauthorized: you do not have permission to update this event");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      {
        ...event,
        category: event.categoryId,
        sponsors: event.sponsors,
        showWorkSubmissionPopup: Boolean(event.showWorkSubmissionPopup),
      },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteEvent({ eventId, path, userId }: DeleteEventParams) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Check permission: user must be organizer OR admin/creator of the event's organisation
    if (userId) {
      const isOrganizer = event.organizer?.toHexString() === userId;
      let hasOrgAccess = false;

      if (event.organisation) {
        const org = await Organisation.findById(event.organisation);
        if (org) {
          const isCreator = org.creator.toString() === userId;
          const isAdmin = org.admins.some(
            (adminId: any) => adminId.toString() === userId
          );
          hasOrgAccess = isCreator || isAdmin;
        }
      }

      if (!isOrganizer && !hasOrgAccess) {
        throw new Error("Unauthorized: you do not have permission to delete this event");
      }
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

// GET ALL EVENTS
export async function getAllEvents({
  country,
  query,
  limit = 6,
  page,
  category,
  date,
}: GetAllEventsParams) {
  try {
    await connectToDatabase();
    const dateFilter = date
      ? {
        startDateTime: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lte: new Date(`${date}T23:59:59.999Z`),
        },
      }
      : {};
    const countryCondition = country
      ? { country: { $regex: country, $options: "i" } }
      : {};

    const titleCondition = query
      ? { title: { $regex: query, $options: "i" } }
      : {};

    let categoryCondition = null;
    if (category && category !== "all" && category !== "forYou") {
      categoryCondition = await getCategoryByName(category || "");
      if (!categoryCondition) {
        return {
          data: [],
          totalPages: 0,
        };
      }
    }

    const conditions = {
      $and: [
        dateFilter,
        countryCondition,
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };
    console.log(JSON.stringify(conditions));
    const skipAmount = (Number(page) - 1) * limit;
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);
    // console.log("events", JSON.stringify(events));
    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET EVENTS BY ORGANIZER (includes events from orgs where user is admin)
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    // Find all organisations the user is creator or admin of
    const userOrgs = await Organisation.find({
      $or: [
        { creator: userId },
        { admins: userId },
      ],
    }).select("_id");
    const orgIds = userOrgs.map((org: any) => org._id);

    // Events where user is organizer OR belongs to user's organisations
    const conditions = {
      $or: [
        { organizer: userId },
        { organisation: { $in: orgIds } },
      ],
    };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
export const createSponsorAction = async ({
  eventId,

  fromDate,
  toDate,
  costPerDay,
}: {
  eventId: string;

  fromDate: string;
  toDate: string;
  costPerDay: number;
}) => {
  try {
    // Validate input
    if (!eventId || !fromDate || !toDate || !costPerDay) {
      throw new Error("Missing required fields.");
    }

    const from = parseISO(fromDate);
    const to = parseISO(toDate);

    if (!isValid(from) || !isValid(to)) {
      throw new Error("Invalid date format.");
    }

    const days = differenceInDays(to, from) + 1;
    if (days <= 0) {
      throw new Error('"To Date" must be after "From Date".');
    }

    const totalCost = days * costPerDay;

    // Connect to MongoDB
    await connectToDatabase();

    // Save sponsorship to the database
    const sponsor = new Sponsor({
      eventId,
      fromDate: from,
      toDate: to,
      totalCost,
    });

    await sponsor.save();

    return {
      success: true,
      message: "Sponsorship created successfully!",
    };
  } catch (error: any) {
    console.error("Error creating sponsorship:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};
export async function restrictEvent(eventId: string) {
  try {
    await connectToDatabase();
    const event = await Event.findById(eventId);
    console.log(event);
    if (!event) throw new Error("Event not found");

    event.restricted = true;
    await event.save();
    await Report.updateMany({ eventId }, { status: "resolved" });
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}
export async function adminBanEventCreator(eventId: string) {
  try {
    await connectToDatabase();
    const event = await Event.findById(eventId);
    console.log(event);
    if (!event) throw new Error("Event not found");
    const creator = await User.findById(event.organizer);
    if (!creator) throw new Error("Creator not found");
    creator.banned = true;
    await creator.save();
    await Report.updateMany({ eventId }, { status: "resolved" });
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

export async function addScanPoint(eventId: string, scanPoint: string) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    // Initialize scanPoints if it doesn't exist (legacy events)
    if (!event.scanPoints) {
      event.scanPoints = [];
    }

    if (!event.scanPoints.includes(scanPoint)) {
      event.scanPoints.push(scanPoint);
      await event.save();
    }

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

export async function removeScanPoint(eventId: string, scanPoint: string) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.scanPoints) {
      event.scanPoints = event.scanPoints.filter((p: string) => p !== scanPoint);
      await event.save();
    }

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    handleError(error);
  }
}

export async function getEventDates() {
  try {
    await connectToDatabase();

    const eventDates = await Event.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startDateTime" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    return JSON.parse(JSON.stringify(eventDates));
  } catch (error) {
    handleError(error);
  }
}

// GET EVENT REPORT DATA
export async function getEventReportData(eventId: string) {
  try {
    await connectToDatabase();

    // Get event details
    const event = await populateEvent(Event.findById(eventId));
    if (!event) throw new Error("Event not found");

    // Get order statistics
    const orders = await Order.find({ event: eventId }).populate({
      path: "buyer",
      model: User,
      select: "firstName lastName",
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (o.totalAmount || 0),
      0
    );
    const uniqueBuyers = new Set(
      orders.map((o: any) => o.buyer?._id?.toString())
    ).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Breakdown by type
    const ordersByType: Record<string, number> = {};
    orders.forEach((o: any) => {
      const type = o.type || "paid";
      ordersByType[type] = (ordersByType[type] || 0) + 1;
    });

    // Breakdown by category
    const ordersByCategory: Record<string, number> = {};
    orders.forEach((o: any) => {
      const cat = o.category || "attendee";
      ordersByCategory[cat] = (ordersByCategory[cat] || 0) + 1;
    });

    // Revenue by ticket type
    const revenueByType: Record<string, number> = {};
    orders.forEach((o: any) => {
      const type = o.type || "paid";
      revenueByType[type] = (revenueByType[type] || 0) + Number(o.totalAmount || 0);
    });

    // Price plan performance from order details
    const pricePlanPerformance: Record<
      string,
      { orders: number; revenue: number }
    > = {};
    orders.forEach((o: any) => {
      if (!Array.isArray(o.details)) return;
      o.details.forEach((detail: any) => {
        const name = (detail?.name || "Unnamed plan").toString().trim();
        const rawPrice = String(detail?.price || "0")
          .replace(/[^\d,.-]/g, "")
          .replace(",", ".");
        const parsedPrice = Number(rawPrice);
        if (!pricePlanPerformance[name]) {
          pricePlanPerformance[name] = { orders: 0, revenue: 0 };
        }
        pricePlanPerformance[name].orders += 1;
        pricePlanPerformance[name].revenue += Number.isFinite(parsedPrice)
          ? parsedPrice
          : Number(o.totalAmount || 0);
      });
    });

    const topPricePlans = Object.entries(pricePlanPerformance)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Order trend by day
    const ordersTrendByDay: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (!ordersTrendByDay[key]) {
        ordersTrendByDay[key] = { orders: 0, revenue: 0 };
      }
      ordersTrendByDay[key].orders += 1;
      ordersTrendByDay[key].revenue += Number(o.totalAmount || 0);
    });
    const orderTrend = Object.entries(ordersTrendByDay)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, values]) => ({
        date,
        orders: values.orders,
        revenue: Number(values.revenue.toFixed(2)),
      }));

    // Get attendance / scan point data
    const attendances = await Attendance.find({ event: eventId })
      .populate({
        path: "order",
        model: Order,
        populate: {
          path: "buyer",
          model: User,
          select: "firstName lastName",
        },
      })
      .sort({ scannedAt: "desc" });

    // Group by scan point
    const scanPointData: Record<
      string,
      { count: number; entries: any[] }
    > = {};
    attendances.forEach((a: any) => {
      const point = a.scanPoint || "default";
      if (!scanPointData[point]) {
        scanPointData[point] = { count: 0, entries: [] };
      }
      scanPointData[point].count += 1;
      scanPointData[point].entries.push({
        attendee: a.order?.buyer
          ? `${a.order.buyer.firstName} ${a.order.buyer.lastName}`
          : "Unknown",
        scannedAt: a.scannedAt,
      });
    });

    const uniqueScannedAttendees = new Set(
      attendances.map((a: any) => a.order?.buyer?._id?.toString()).filter(Boolean)
    ).size;
    const attendanceRate =
      uniqueBuyers > 0 ? Number(((uniqueScannedAttendees / uniqueBuyers) * 100).toFixed(1)) : 0;

    // Scan activity by hour
    const scanActivityByHour: Record<string, number> = {};
    for (let h = 0; h < 24; h++) {
      scanActivityByHour[String(h).padStart(2, "0")] = 0;
    }
    attendances.forEach((a: any) => {
      const hour = new Date(a.scannedAt).getHours().toString().padStart(2, "0");
      scanActivityByHour[hour] = (scanActivityByHour[hour] || 0) + 1;
    });

    // Automated highlights
    const highlights: string[] = [];
    if (totalOrders === 0) {
      highlights.push("Aucune commande enregistrée pour cet événement.");
    } else {
      highlights.push(
        `${totalOrders} commandes générées pour ${uniqueBuyers} participants uniques.`
      );
      highlights.push(
        `Panier moyen estimé: ${formatPriceByCountry(averageOrderValue, event.country)} par commande.`
      );
      highlights.push(
        `Taux de présence scannée: ${attendanceRate}% (${uniqueScannedAttendees} participants scannés).`
      );
    }
    if (topPricePlans.length > 0) {
      highlights.push(
        `Plan le plus performant: ${topPricePlans[0].name} (${topPricePlans[0].orders} ventes).`
      );
    }

    return JSON.parse(
      JSON.stringify({
        event,
        stats: {
          totalOrders,
          totalRevenue,
          uniqueBuyers,
          uniqueScannedAttendees,
          attendanceRate,
          averageOrderValue,
          ordersByType,
          ordersByCategory,
          revenueByType,
          scanActivityByHour,
          topPricePlans,
          orderTrend,
          highlights,
        },
        scanPointData,
      })
    );
  } catch (error) {
    handleError(error);
  }
}
