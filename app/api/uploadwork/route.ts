// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getUserWorkByEvent,
  submitWorkSummary,
  appendWorkSubmissionImage,
} from "@/lib/actions/user.actions";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;
  const eventId = (body.eventId as string) || "";
  const userId = (body.userId as string) || "";
  const workId = (body.workId as string) || "";

  if (file && (file as File).size > 0) {
    const fileName = (body.file as File).name;
    if (!isImageFile(fileName)) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed (jpg, png, gif, webp)." },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());
    const fileExtension = path.extname(fileName);
    const newFileName = `${path.basename(fileName, fileExtension)}_${uuidv4()}${fileExtension}`;
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    try {
      fs.writeFileSync(path.resolve(UPLOAD_DIR, newFileName), buffer);
      await appendWorkSubmissionImage({
        workId,
        eventId,
        userId,
        fileUrl: `/uploads/${newFileName}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      name: fileName,
    });
  }

  const title = (body.title as string) || "";
  const note = (body.note as string) || "";
  let clientInfo = {};
  try {
    const raw = body.clientInfo as string;
    if (raw && typeof raw === "string") clientInfo = JSON.parse(raw);
  } catch {
    // leave clientInfo empty
  }

  if (eventId && userId && (title || note)) {
    try {
      const work = await submitWorkSummary({
        workId: workId || undefined,
        eventId,
        userId,
        title: title || "Sans titre",
        clientInfo: clientInfo as { firstName?: string; lastName?: string; jobTitle?: string; republic?: string; city?: string; village?: string },
        note: note || "",
      });
      return NextResponse.json({ success: true, work });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submit failed";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { success: false, error: "Missing eventId, userId, or summary data." },
    { status: 400 }
  );
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
