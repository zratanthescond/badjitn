import { NextRequest, NextResponse } from "next/server";
import { uploadToFileServer } from "@/lib/upload-to-server";

export async function POST(req: NextRequest) {
  console.log("[API Route /api/upload] Received incoming POST request.");
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      console.error("[API Route /api/upload] File object not found in formData payload.");
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    console.log("[API Route /api/upload] Found file in payload:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("[API Route /api/upload] Extracted arrayBuffer, buffer size in bytes:", buffer.length);

    console.log("[API Route /api/upload] Calling uploadToFileServer helper...");
    const fileUrl = await uploadToFileServer(buffer, file.name, file.type);
    console.log("[API Route /api/upload] uploadToFileServer successfully returned URL:", fileUrl);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("[API Route /api/upload] Caught exception during upload:", error.message || error);
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}
