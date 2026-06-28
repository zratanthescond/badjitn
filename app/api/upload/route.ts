import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi({
  token: process.env.UPLOADTHING_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error("UploadThing error:", response.error);
      return NextResponse.json({ success: false, message: response.error.message }, { status: 500 });
    }

    const url = response.data.ufsUrl;
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: error?.message ?? "Server Error" }, { status: 500 });
  }
}
