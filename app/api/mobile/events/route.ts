"use server";

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@clerk/backend";

import { createEvent } from "@/lib/actions/event.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import type { CreateEventParams } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Authenticate the mobile request using Clerk Bearer token
    const requestState = await authenticateRequest({
      request: req,
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    if (!requestState.isSignedIn || !requestState.session || !requestState.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = requestState.userId;

    await connectToDatabase();
    const user = await User.findOne({ clerkId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found for this Clerk account" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json({ error: "User is banned" }, { status: 403 });
    }

    // Minimal payload mapping from mobile form to your event schema.
    // Extend this as you add more fields to the mobile UI.
    const now = new Date();
    const createParams: CreateEventParams = {
      userId: String(user._id),
      event: {
        title: body.title,
        description: body.description ?? "",
        location: {
          name: body.locationName ?? "",
          lon: body.locationLon ?? 0,
          lat: body.locationLat ?? 0,
        },
        pricePlan: body.pricePlan ?? [],
        imageUrl: body.imageUrl ?? "",
        startDateTime: body.startDateTime ? new Date(body.startDateTime) : now,
        endDateTime: body.endDateTime ? new Date(body.endDateTime) : now,
        categoryId: body.categoryId ?? "",
        price: body.price ?? "0",
        isFree: !!body.isFree,
        isOnline: !!body.isOnline,
        url: body.url ?? "",
        sponsors: body.sponsors ?? [],
        requiredInfo: body.requiredInfo ?? [],
        country: body.country ?? "",
        discount: body.discount ?? {
          field: "",
          value: "",
          discount: 0,
        },
        places: body.places ?? 0,
      },
      path: "/",
    };

    const created = await createEvent(createParams);

    if (!created) {
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Mobile create event error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

