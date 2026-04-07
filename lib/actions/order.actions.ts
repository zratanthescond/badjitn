"use server";

import Stripe from "stripe";
import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from "@/types";
import { redirect } from "next/navigation";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Order from "../database/models/order.model";
import Event from "../database/models/event.model";
import { ObjectId } from "mongodb";
import User from "../database/models/user.model";
import { getCurrencyCodeByCountry } from "../utils";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    await connectToDatabase();
    const event = await Event.findById(order.eventId).select(
      "country location showWorkSubmissionPopup"
    );
    const price = order.isFree ? 0 : Number(order.price) * 100;
    const currency = getCurrencyCodeByCountry(event?.country, event?.location).toLowerCase();
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    const successUrl = `${normalizedBaseUrl}/events/${order.eventId}?registered=1`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: price,
            product_data: {
              name: order.eventTitle,
              metadata: { name: "dfdfdfdfdf", price: 200 },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId || "",
        details: JSON.stringify(order.details),
        requiredUserInfo: JSON.stringify(order.requiredUserInfo || []),
        discountInfo: JSON.stringify(order.discountInfo || null),
      },
      mode: "payment",
      success_url: successUrl,
      cancel_url: `${normalizedBaseUrl}/events/${order.eventId}`,
    });

    redirect(session.url!);
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();
    const buyer = order.buyerId
      ? await User.findOne({ clerkId: order.buyerId })
      : null;
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      ...(buyer ? { buyer: buyer._id } : {}),
    });

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

// GET ORDERS BY EVENT
export async function getOrdersByEvent({
  searchString,
  eventId,
}: GetOrdersByEventParams) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error("Event ID is required");
    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: {
          path: "$buyer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          buyerDisplay: {
            $ifNull: [
              {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ["$buyer.firstName", ""] },
                      " ",
                      { $ifNull: ["$buyer.lastName", ""] },
                    ],
                  },
                },
              },
              "",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          eventCountry: "$event.country",
          buyer: {
            $cond: [
              { $gt: [{ $strLenCP: "$buyerDisplay" }, 0] },
              "$buyerDisplay",
              "Guest registration",
            ],
          },
          type: 1,
          details: 1,
          discountInfo: 1,
          requiredUserInfo: 1,
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString || "", "i") } },
          ],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: userId };

    const orders = await Order.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .select("event createdAt totalAmount details type")
      .populate({
        path: "event",
        model: Event,
        select:
          "title imageUrl startDateTime endDateTime location price isFree country pricePlan category organizer organisation",
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName photo",
        },
      });

    const ordersCount = await Order.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
export const getOrderByEventAndBuyer = async (
  eventId: string,
  userId: string,
) => {
  try {
    await connectToDatabase();

    const order = await Order.findOne({
      event: eventId,
      buyer: userId,
    })
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      })
      .populate({
        path: "buyer",
        model: User,
        select: "_id firstName lastName",
      });

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    await connectToDatabase();

    const order = await Order.findById(orderId)
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      })
      .populate({
        path: "buyer",
        model: User,
        select: "_id firstName lastName",
      });

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

export const checkExistingRegistration = async (eventId: string, email: string) => {
  try {
    await connectToDatabase();

    const existingOrder = await Order.findOne({
      event: eventId,
      requiredUserInfo: {
        $elemMatch: {
          field: "email",
          value: { $regex: new RegExp(`^${email.trim()}$`, "i") },
        },
      },
    });

    return !!existingOrder;
  } catch (error) {
    console.error("Error checking existing registration:", error);
    return false;
  }
};

