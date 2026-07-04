import { NextRequest, NextResponse } from "next/server";
import { uploadToFileServer } from "@/lib/upload-to-server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload the file to hls-server using our secure server-side helper
    const fileUrl = await uploadToFileServer(buffer, file.name, file.type);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}
