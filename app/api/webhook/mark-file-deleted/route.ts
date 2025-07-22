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

    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    await connectToDatabase()

    const eventResult = await Event.updateMany(
      {
        $or: [{ photoUrl: { $regex: filePath, $options: "i" } }, { photoUrl: filePath }, { photoUrl: `/${filePath}` }],
      },
      {
        $set: {
          deleted: true,
          deletedAt: new Date(),
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
      },
      {
        $set: {
          deleted: true,
          deletedAt: new Date(),
        },
      },
    )

    const totalModified = eventResult.modifiedCount + musicResult.modifiedCount

    return NextResponse.json({
      success: true,
      modified: totalModified,
      events: eventResult.modifiedCount,
      music: musicResult.modifiedCount,
    })
  } catch (error) {
    console.error("Mark file deleted error:", error)
    return NextResponse.json({ error: "Failed to mark file as deleted" }, { status: 500 })
  }
}
