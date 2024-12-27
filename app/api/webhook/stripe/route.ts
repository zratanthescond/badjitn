import stripe from "stripe";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/order.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { de } from "date-fns/locale";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  console.log("stripe webhook called");
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log(err.error.raw);
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;
  console.log(eventType);
  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;
    console.log(metadata?.buyerId);
    if (!metadata?.eventId || !metadata?.buyerId) {
      return NextResponse.json(
        { message: "Missing metadata" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const userId = await User.findOne({ clerkId: metadata?.buyerId });

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || "",
      buyerId: userId?._id || "",
      totalAmount: amount_total ? (amount_total / 100).toString() : "0",
      createdAt: new Date(),
      details: metadata?.details,
    };

    const newOrder = await createOrder(order);
    return NextResponse.json({ message: "OK", order: newOrder });
  }

  return new Response("", { status: 200 });
}
