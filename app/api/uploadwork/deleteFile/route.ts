import { connectToDatabase } from "@/lib/database";
import EventWork from "@/lib/database/models/work.model";

import { handleError } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: NextResponse) {
  const body = await req.json();
  const { fileUrl } = body;
  if (!fileUrl)
    return NextResponse.json({ error: "File not found" }, { status: 400 });
  try {
    await connectToDatabase();
    await EventWork.updateOne(
      { _id: body.workId },
      { $pull: { fileUrls: fileUrl } }
    );
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    handleError(error);
  }
}
