import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import Music from "@/lib/database/models/music.model";
import { promises as fs } from "fs";
import path from "path";

// Helper function to extract folder ID from file path
function extractFolderIdFromPath(filePath: string): string | null {
  const uuidRegex =
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
  const match = filePath.match(uuidRegex);
  return match ? match[1] : null;
}

// Helper function to check if folder exists in file system
async function checkFolderExists(folderId: string): Promise<boolean> {
  try {
    const folderPath = path.join(process.cwd(), "public", "music", folderId);
    const stats = await fs.stat(folderPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

// Helper function to get all files in the folder
async function getFolderContents(folderId: string): Promise<string[]> {
  try {
    const folderPath = path.join(process.cwd(), "public", "music", folderId);
    const files = await fs.readdir(folderPath);
    return files;
  } catch (error) {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.headers.get("x-webhook-secret");
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filePath } = await request.json();
    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }
    console.log("Checking file path:", filePath);
    await connectToDatabase();

    const folderId = extractFolderIdFromPath(filePath);

    const eventExists = await Event.exists({
      $or: [
        { photoUrl: { $regex: filePath, $options: "i" } },
        { photoUrl: filePath },
        { photoUrl: `/${filePath}` },
        { photoUrl: `http://localhost:4000/${filePath}` },
        { photoUrl: `https://yourdomain.com/${filePath}` },
        ...(folderId
          ? [{ photoUrl: { $regex: folderId, $options: "i" } }]
          : []),
      ],
    });

    const musicExists = await Music.exists({
      $or: [
        { path: { $regex: filePath, $options: "i" } },
        { image: { $regex: filePath, $options: "i" } },
        { wave: { $regex: filePath, $options: "i" } },
        { path: filePath },
        { image: filePath },
        { wave: filePath },
        { path: `/${filePath}` },
        { image: `/${filePath}` },
        { wave: `/${filePath}` },
        ...(folderId
          ? [
              { path: { $regex: folderId, $options: "i" } },
              { image: { $regex: folderId, $options: "i" } },
              { wave: { $regex: folderId, $options: "i" } },
            ]
          : []),
      ],
    });

    const exists = !!(eventExists || musicExists);

    return NextResponse.json({
      exists,
      foundIn: {
        events: !!eventExists,
        music: !!musicExists,
      },
      folderId,
      folderFoundInDb: !!(eventExists || musicExists),
    });
  } catch (error) {
    console.error("Check file exists error:", error);
    return NextResponse.json(
      {
        error: "Failed to check file existence",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
