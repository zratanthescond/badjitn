import { createOrder } from "@/lib/actions/order.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
export async function POST(req: Request, res: Response) {
  const data = await req.json();
  // console.log(data);
  const details = [];
  if (data.checkPlan && data.checkPlan.length > 0) {
    data.checkPlan.map((plan: number) => {
      details.push(data.event.pricePlan[plan]);
    });
  }
  console.log(details);
  if (data.event && data.contributorId) {
    const order = await createOrder({
      buyerId: data.contributorId as string,
      eventId: data.event._id,
      stripeId: uuidv4(),
      createdAt: new Date(),
      totalAmount: "0",
      type: "hosted",
      details: details,
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
