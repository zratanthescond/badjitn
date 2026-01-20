import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { file: string } },
) {
  const filePath = path.join(process.cwd(), "public/uploads", params.file);

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": "image/png" }, // Change based on your file type
    });
  }

  return new NextResponse("Not Found", { status: 404 });
}
