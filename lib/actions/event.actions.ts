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
import Report from "../database/models/report.model";
import Order from "../database/models/order.model";
import Attendance from "../database/models/attendance.model";
import { verifyAdmin, verifyOrganizerOrAdmin } from "./auth.actions";

// HELPERS
const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};

const populateEvent = (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select: "_id firstName lastName username photo clerkId",
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

    const organisationId = event.organisationId;
    if (!organisationId) throw new Error("Organisation is required to create an event");

    const org = await Organisation.findById(organisationId);
    if (!org) throw new Error("Organisation not found");

    const isCreator = org.creator.toString() === userId;
    const isAdmin = org.admins.some((adminId: any) => adminId.toString() === userId);

    if (!isCreator && !isAdmin) {
      throw new Error("You do not have permission to create events for this organisation");
    }

    if (!org.isVerified) {
      throw new Error("This organisation must be verified by an admin before you can create events.");
    }

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: userId,
      organisation: organisationId,
      showWorkSubmissionPopup: Boolean(event.showWorkSubmissionPopup),
      allowGuestRegistration: event.allowGuestRegistration !== false,
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
    if (!eventToUpdate) throw new Error("Event not found");

    const isOrganizer = eventToUpdate.organizer?.toHexString() === userId;
    let hasOrgAccess = false;

    if (eventToUpdate.organisation) {
      const org = await Organisation.findById(eventToUpdate.organisation);
      if (org) {
        const isCreator = org.creator.toString() === userId;
        const isAdmin = org.admins.some((adminId: any) => adminId.toString() === userId);
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
        showWorkSubmissionPopup: Boolean(event.showWorkSubmissionPopup),
        allowGuestRegistration: event.allowGuestRegistration !== false,
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

    if (userId) {
      const isOrganizer = event.organizer?.toHexString() === userId;
      let hasOrgAccess = false;

      if (event.organisation) {
        const org = await Organisation.findById(event.organisation);
        if (org) {
          const isCreator = org.creator.toString() === userId;
          const isAdmin = org.admins.some((adminId: any) => adminId.toString() === userId);
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
    
    const conditions: any = { $and: [] };
    
    if (date) {
      conditions.$and.push({
        startDateTime: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lte: new Date(`${date}T23:59:59.999Z`),
        },
      });
    }

    if (country) {
      conditions.$and.push({ country: { $regex: country, $options: "i" } });
    }

    if (query) {
      conditions.$and.push({ title: { $regex: query, $options: "i" } });
    }

    if (category && category !== "all" && category !== "forYou") {
      const categoryDoc = await getCategoryByName(category);
      if (categoryDoc) {
        conditions.$and.push({ category: categoryDoc._id });
      } else {
        return { data: [], totalPages: 0 };
      }
    }

    if (conditions.$and.length === 0) delete conditions.$and;

    const skipAmount = (Number(page) - 1) * limit;
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

// GET EVENTS BY USER
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();

    const userOrgs = await Organisation.find({
      $or: [{ creator: userId }, { admins: userId }],
    }).select("_id");
    const orgIds = userOrgs.map((org: any) => org._id);

    const conditions = {
      $or: [{ organizer: userId }, { organisation: { $in: orgIds } }],
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

// GET RELATED EVENTS
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

// ADMIN ACTIONS
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
    if (!eventId || !fromDate || !toDate || !costPerDay) throw new Error("Missing required fields.");

    const from = parseISO(fromDate);
    const to = parseISO(toDate);

    if (!isValid(from) || !isValid(to)) throw new Error("Invalid date format.");

    const days = differenceInDays(to, from) + 1;
    if (days <= 0) throw new Error('"To Date" must be after "From Date".');

    const totalCost = days * costPerDay;

    await connectToDatabase();

    const sponsor = new Sponsor({
      eventId,
      fromDate: from,
      toDate: to,
      totalCost,
    });

    await sponsor.save();

    return { success: true, message: "Sponsorship created successfully!" };
  } catch (error: any) {
    console.error("Error creating sponsorship:", error.message);
    return { success: false, message: error.message };
  }
};

export async function restrictEvent(eventId: string) {
  try {
    await verifyAdmin();
    await connectToDatabase();
    const event = await Event.findById(eventId);
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
    await verifyAdmin();
    await connectToDatabase();
    const event = await Event.findById(eventId);
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

// SCANNING AND REPORTING
export async function addScanPoint(eventId: string, scanPoint: string) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (!event.scanPoints) event.scanPoints = [];

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
    await verifyOrganizerOrAdmin(eventId);
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
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startDateTime" } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
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

    const event = await populateEvent(Event.findById(eventId));
    if (!event) throw new Error("Event not found");

    const orders = await Order.find({ event: eventId }).populate({
      path: "buyer",
      model: User,
      select: "firstName lastName email phone_number",
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const uniqueBuyers = new Set(orders.map((o: any) => o.buyer?._id?.toString())).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByType: Record<string, number> = {};
    const ordersByCategory: Record<string, number> = {};
    const revenueByType: Record<string, number> = {};

    orders.forEach((o: any) => {
      const type = Number(o.totalAmount) === 0 ? "free" : o.type || "paid";
      ordersByType[type] = (ordersByType[type] || 0) + 1;
      const cat = o.category || "attendee";
      ordersByCategory[cat] = (ordersByCategory[cat] || 0) + 1;
      revenueByType[type] = (revenueByType[type] || 0) + (o.totalAmount || 0);
    });

    const pricePlanPerformance: Record<string, { orders: number; revenue: number; options: Record<string, { orders: number; revenue: number }> }> = {};
    orders.forEach((o: any) => {
      if (!Array.isArray(o.details)) return;
      o.details.forEach((detail: any) => {
        const name = (detail?.name || "Unnamed plan").toString().trim();
        const option = (detail?.option || "").toString().trim();
        const rawPrice = String(detail?.price || "0").replace(/[^\d,.-]/g, "").replace(",", ".");
        const parsedPrice = Number(rawPrice);
        const finalPrice = Number.isFinite(parsedPrice) ? parsedPrice : (o.totalAmount || 0);

        if (!pricePlanPerformance[name]) {
          pricePlanPerformance[name] = { orders: 0, revenue: 0, options: {} };
        }
        pricePlanPerformance[name].orders += 1;
        pricePlanPerformance[name].revenue += finalPrice;

        if (option) {
          if (!pricePlanPerformance[name].options[option]) {
            pricePlanPerformance[name].options[option] = { orders: 0, revenue: 0 };
          }
          pricePlanPerformance[name].options[option].orders += 1;
          pricePlanPerformance[name].options[option].revenue += finalPrice;
        }
      });
    });

    const topPricePlans = Object.entries(pricePlanPerformance)
      .map(([name, value]) => ({ 
        name, 
        ...value,
        optionsBreakdown: Object.entries(value.options).map(([optName, optVal]) => ({
          name: optName,
          ...optVal
        })).sort((a,b) => b.orders - a.orders)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15);

    const ordersTrendByBucket: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      const d = new Date(o.createdAt);
      const day = d.toISOString().slice(0, 10);
      const hour = d.getHours();
      const bucket = Math.floor(hour / 3) * 3;
      const key = `${day} ${String(bucket).padStart(2, "0")}:00`;
      
      if (!ordersTrendByBucket[key]) ordersTrendByBucket[key] = { orders: 0, revenue: 0 };
      ordersTrendByBucket[key].orders += 1;
      ordersTrendByBucket[key].revenue += (o.totalAmount || 0);
    });
    
    const orderTrend = Object.entries(ordersTrendByBucket)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, values]) => ({
        date,
        orders: values.orders,
        revenue: Number(values.revenue.toFixed(2)),
      }));

    const attendances = await Attendance.find({ event: eventId })
      .populate({
        path: "order",
        model: Order,
        populate: { path: "buyer", model: User, select: "firstName lastName" },
      })
      .sort({ scannedAt: "desc" });

    const scanPointData: Record<string, { count: number; entries: any[] }> = {};
    attendances.forEach((a: any) => {
      const point = a.scanPoint || "default";
      if (!scanPointData[point]) scanPointData[point] = { count: 0, entries: [] };
      scanPointData[point].count += 1;
      
      let attendeeName = "Participant Inconnu";
      if (a.order?.buyer) {
        attendeeName = `${a.order.buyer.firstName} ${a.order.buyer.lastName}`;
      } else if (a.order?.requiredUserInfo) {
        const getScanInfo = (keywords: string[]) => 
          a.order.requiredUserInfo.find((i: any) => 
            keywords.includes(i.field?.toLowerCase()) || keywords.includes(i.label?.toLowerCase())
          )?.value || "";
        const fName = getScanInfo(["firstname", "first_name", "prenom", "prénom", "first name"]);
        const lName = getScanInfo(["lastname", "last_name", "nom", "familyname", "last name", "family name"]);
        const fullName = getScanInfo(["name", "fullname", "nomcomplet", "full name", "nom complet"]);
        
        if (fullName) attendeeName = fullName;
        else if (fName || lName) attendeeName = `${fName} ${lName}`.trim();
      }

      scanPointData[point].entries.push({
        attendee: attendeeName,
        scannedAt: a.scannedAt,
      });
    });

    const uniqueScannedAttendees = new Set(attendances.map((a: any) => a.order?.buyer?._id?.toString()).filter(Boolean)).size;
    const attendanceRate = uniqueBuyers > 0 ? Number(((uniqueScannedAttendees / uniqueBuyers) * 100).toFixed(1)) : 0;

    const scanActivityByHour: Record<string, number> = {};
    for (let h = 0; h < 24; h++) scanActivityByHour[String(h).padStart(2, "0")] = 0;
    attendances.forEach((a: any) => {
      const hour = new Date(a.scannedAt).getHours().toString().padStart(2, "0");
      scanActivityByHour[hour] = (scanActivityByHour[hour] || 0) + 1;
    });

    const participantsList: any[] = [];
    const participantsByPlan: Record<string, any[]> = {};

    orders.forEach((o: any) => {
      let userName = "";
      let userEmail = o.buyer?.email || "";
      let userPhone = o.buyer?.phone_number || "";

      if (o.buyer) userName = `${o.buyer.firstName || ""} ${o.buyer.lastName || ""}`.trim();

      if (o.requiredUserInfo && Array.isArray(o.requiredUserInfo)) {
        const getInfo = (keywords: string[]) => 
          o.requiredUserInfo.find((i: any) => 
            keywords.includes(i.field?.toLowerCase()) || keywords.includes(i.label?.toLowerCase())
          )?.value || "";

        const fName = getInfo(["firstname", "first_name", "prenom", "prénom", "first name"]);
        const lName = getInfo(["lastname", "last_name", "nom", "familyname", "last name", "family name"]);
        const fullName = getInfo(["name", "fullname", "nomcomplet", "full name", "nom complet"]);
        const email = getInfo(["email", "e-mail", "courriel"]);
        const phone = getInfo(["phone", "telephone", "téléphone", "phone_number", "mobile", "celulaire", "numéro de téléphone", "phone number"]);
        const city = getInfo(["city", "ville", "village", "town", "gouvernorat", "republic"]);

        if (fullName) userName = fullName;
        else if (fName || lName) userName = `${fName} ${lName}`.trim();

        if (email) userEmail = email.trim();
        if (phone) userPhone = phone.trim();
        if (city) (o as any).extractedCity = city.trim();
      }

      userName = userName || "Participant Inconnu";
      userEmail = userEmail || "-";
      userPhone = userPhone || "-";
      const userCity = (o as any).extractedCity || "-";

      const detailsArray = Array.isArray(o.details) && o.details.length > 0 
        ? o.details 
        : [{ name: o.type === "free" ? "Gratuit" : "Inscription", price: o.totalAmount }];

      const orderPlans = detailsArray.map((detail: any) => ({
        plan: detail.name || "Plan",
        choice: detail.option || "",
        amount: Number(detail.price || 0) || Number(o.totalAmount || 0),
      }));

      // Merged participant for the main list
      const mergedParticipant = {
        name: userName,
        email: userEmail,
        phone: userPhone,
        city: userCity,
        plans: orderPlans,
        createdAt: o.createdAt,
        totalAmount: o.totalAmount || orderPlans.reduce((sum: number, p: any) => sum + p.amount, 0),
      };
      participantsList.push(mergedParticipant);

      // Flat details for the per-plan breakdown
      detailsArray.forEach((detail: any) => {
        const planName = detail.name || "Plan";
        const participantObj = {
          name: userName,
          email: userEmail,
          phone: userPhone,
          city: userCity,
          plan: planName,
          choice: detail.option || "",
          createdAt: o.createdAt,
          amount: Number(detail.price || 0) || Number(o.totalAmount || 0),
        };
        
        if (!participantsByPlan[planName]) participantsByPlan[planName] = [];
        participantsByPlan[planName].push(participantObj);
      });
    });

    // Recalculate unique participants based on the final merged list
    const uniqueEmails = new Set(participantsList.map(p => p.email.toLowerCase().trim()).filter(e => e && e !== "-"));
    const uniqueNames = new Set(participantsList.map(p => p.name.toLowerCase().trim()).filter(n => n && n !== "participant inconnu"));
    const finalUniqueBuyers = Math.max(uniqueEmails.size, uniqueNames.size);

    const highlights: string[] = [];
    if (totalOrders > 0) {
      highlights.push(`${totalOrders} inscriptions enregistrées pour ${finalUniqueBuyers} participants uniques.`);
      highlights.push(`Contribution moyenne estimée: ${formatPriceByCountry(averageOrderValue, event.country)} par inscription.`);
      highlights.push(`Taux de présence scannée: ${attendanceRate}% (${uniqueScannedAttendees} participants scannés).`);
    } else {
      highlights.push("Aucune inscription enregistrée pour cet événement.");
    }

    return JSON.parse(JSON.stringify({
      event,
      stats: {
        totalOrders,
        totalRevenue,
        uniqueBuyers: finalUniqueBuyers,
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
        participantsList,
        participantsByPlan,
      },
      scanPointData,
    }));
  } catch (error) {
    handleError(error);
  }
}
