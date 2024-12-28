import { createOrder } from "@/lib/actions/order.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: Request, res: Response) {
  const data = await req.json();
  console.log(data);
  if (data.eventId && data.contributorId) {
    const order = await createOrder({
      buyerId: data.contributorId as string,
      eventId: data.eventId,
      stripeId: "this event is hosted",
      createdAt: new Date(),
      totalAmount: "0",
      type: "hosted",
    });
    if (order) {
      return NextResponse.json(
        { data: JSON.stringify(order) },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "an error occured" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "invalid credecials" }, { status: 400 });
  }
}
