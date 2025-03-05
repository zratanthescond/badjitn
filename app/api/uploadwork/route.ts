// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUserWorkByEvent, uploadWork } from "@/lib/actions/user.actions";
import { v4 as uuidv4 } from "uuid";

// Define the POST handler for the file upload
const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");
console.log(UPLOAD_DIR);
export const POST = async (req: Request) => {
  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  console.log("req", body);
  const file = (body.file as Blob) || null;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = (body.file as File).name;
    const fileExtension = path.extname(fileName);
    const newFileName = `${path.basename(
      fileName,
      fileExtension
    )}_${uuidv4()}${fileExtension}`;
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }
    try {
      fs.writeFileSync(path.resolve(UPLOAD_DIR, newFileName), buffer);
      const work = await uploadWork({
        fileUrl: `/uploads/${newFileName}`,
        eventId: body.eventId as string,
        userId: body.userId as string,
        note: body.note as string,
      });
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: err,
      });
    }
  } else {
    return NextResponse.json({
      success: false,
    });
  }

  return NextResponse.json({
    success: true,
    name: (body.file as File).name,
  });
};

export const GET = async (req: NextRequest) => {
  const userId = req.nextUrl.searchParams.get("userId") as string;
  const eventId = req.nextUrl.searchParams.get("eventId") as string;
  const works = await getUserWorkByEvent({ userId, eventId });
  if (!works) {
    return NextResponse.json({
      success: false,
    });
  }
  return NextResponse.json({
    success: true,
    works,
  });
};
