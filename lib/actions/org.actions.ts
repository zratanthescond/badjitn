"use server";

import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Organisation from "@/lib/database/models/organisation.model";
import Category from "@/lib/database/models/category.model";
import User from "@/lib/database/models/user.model";

export async function getOrgWithEvents(slug: string) {
  try {
    await connectToDatabase();

    // Try subdomain first (custom short name), then fall back to slug
    const org = await Organisation.findOne({
      $or: [{ subdomain: slug }, { slug }],
    }).lean();
    console.log(`[getOrgWithEvents] query="${slug}" → found:`, org ? (org as any).name : "null", "| subdomain in doc:", (org as any)?.subdomain);
    if (!org) return null;

    const events = await Event.find({ organisation: (org as any)._id })
      .populate({ path: "category", model: Category, select: "_id name" })
      .populate({ path: "organizer", model: User, select: "_id firstName lastName photo" })
      .populate({
        path: "organisation",
        model: Organisation,
        select: "_id name slug logo",
      })
      .sort({ startDateTime: -1 })
      .lean();

    return JSON.parse(JSON.stringify({ org, events }));
  } catch (error) {
    console.error("[getOrgWithEvents]", error);
    return null;
  }
}
