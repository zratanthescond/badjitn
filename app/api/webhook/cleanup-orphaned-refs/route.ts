import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import Event from "@/lib/database/models/event.model"
import Music from "@/lib/database/models/music.model"

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.headers.get("x-webhook-secret")
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { deletedFiles } = await request.json()

    if (!Array.isArray(deletedFiles)) {
      return NextResponse.json({ error: "deletedFiles must be an array" }, { status: 400 })
    }

    await connectToDatabase()

    let totalCleaned = 0

    for (const filePath of deletedFiles) {
      const eventResult = await Event.updateMany(
        {
          $or: [
            { photoUrl: { $regex: filePath, $options: "i" } },
            { photoUrl: filePath },
            { photoUrl: `/${filePath}` },
          ],
          deleted: { $ne: true },
        },
        {
          $set: {
            deleted: true,
            deletedAt: new Date(),
            deletedReason: "File not found on disk",
          },
        },
      )

      const musicResult = await Music.updateMany(
        {
          $or: [
            { path: { $regex: filePath, $options: "i" } },
            { image: { $regex: filePath, $options: "i" } },
            { wave: { $regex: filePath, $options: "i" } },
            { path: filePath },
            { image: filePath },
            { wave: filePath },
          ],
          deleted: { $ne: true },
        },
        {
          $set: {
            deleted: true,
            deletedAt: new Date(),
            deletedReason: "File not found on disk",
          },
        },
      )

      totalCleaned += eventResult.modifiedCount + musicResult.modifiedCount
    }

    return NextResponse.json({
      success: true,
      cleaned: totalCleaned,
      processedFiles: deletedFiles.length,
    })
  } catch (error) {
    console.error("Cleanup orphaned refs error:", error)
    return NextResponse.json({ error: "Failed to cleanup orphaned references" }, { status: 500 })
  }
}
