import { useUser } from "@/lib/actions/user.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: Response) {
  //  const clerkId = req.nextUrl.searchParams.get("clerkId");
  const clerkId = "user_2qjB11CRNqSQhU49dfemouaQJJ0";
  await connectToDatabase();
  if (!clerkId) return new Response(JSON.stringify(null), { status: 200 });
  const user = await User.findOne({
    clerkId: clerkId,
  }); //console.log(user);
  return new Response(JSON.stringify(user), { status: 200 });
}
