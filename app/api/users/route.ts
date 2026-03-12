import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId: authId } = await auth();
  
  if (!authId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const clerkId = req.nextUrl.searchParams.get("clerkId");
  const userId = req.nextUrl.searchParams.get("userId");

  await connectToDatabase();

  if (userId) {
    const user = await User.findById(userId).select(
      "firstName lastName jobTitle republic city village"
    );
    return new Response(JSON.stringify(user ? user.toObject() : null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!clerkId) return new Response(JSON.stringify(null), { status: 200 });
  const user = await User.findOne({ clerkId });
  return new Response(JSON.stringify(user), { status: 200 });
}
