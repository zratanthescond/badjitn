// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getUserWorkByEvent,
  submitWorkSummary,
  appendWorkSubmissionImage,
  appendAbstractFile,
} from "@/lib/actions/user.actions";
import { v4 as uuidv4 } from "uuid";
import { uploadToFileServer } from "@/lib/upload-to-server";

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ABSTRACT_EXTENSIONS = [...IMAGE_EXTENSIONS, ".pdf", ".doc", ".docx"];

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function isAbstractFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ABSTRACT_EXTENSIONS.includes(ext);
}

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;
  const fileUrl = (body.fileUrl as string) || "";
  const eventId = (body.eventId as string) || "";
  const userId = (body.userId as string) || "";
  const workId = (body.workId as string) || "";
  // "abstract" = document attached to the resume, uploadable any time.
  // "poster" (default) = final e-poster, only unlocked once the resume is approved.
  const kind = ((body.kind as string) || "poster") === "abstract" ? "abstract" : "poster";

  if (fileUrl || (file && (file as File).size > 0)) {
    let finalFileUrl = fileUrl;

    if (!fileUrl && file) {
      const fileName = (body.file as File).name;
      const isAllowed = kind === "abstract" ? isAbstractFile(fileName) : isImageFile(fileName);
      if (!isAllowed) {
        const message =
          kind === "abstract"
            ? "Formats acceptés : jpg, png, gif, webp, pdf, doc, docx."
            : "Only image files are allowed (jpg, png, gif, webp).";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
      const buffer = Buffer.from(await (file as Blob).arrayBuffer());
      try {
        finalFileUrl = await uploadToFileServer(buffer, fileName, (body.file as File).type || "image/png");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
    }

    try {
      if (kind === "abstract") {
        await appendAbstractFile({ workId, eventId, userId, fileUrl: finalFileUrl });
      } else {
        await appendWorkSubmissionImage({
          workId,
          eventId,
          userId,
          fileUrl: finalFileUrl,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Database update failed";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: finalFileUrl,
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
