// /pages/api/contributors.ts
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
export const revalidate = 0;
export async function GET(req: NextRequest, res: NextApiResponse) {
  const query = req.nextUrl.searchParams.get("query") as string;
  console.log(req);

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { message: "Search query is required." },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    // Find contributors whose name or email matches the query
    const contributors = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("id firstName lastName email");

    return NextResponse.json({ contributors: contributors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { message: "Failed to fetch contributors." },
      { status: 500 }
    );
  }
}
