import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import Event from "@/lib/database/models/event.model"
import Music from "@/lib/database/models/music.model"

export async function GET(request: NextRequest) {
  try {
    const webhookSecret = request.headers.get("x-webhook-secret")
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const events = await Event.find({ photoUrl: { $exists: true, $ne: null } })
      .select("photoUrl title createdAt")
      .lean()

    const musicFiles = await Music.find({}).select("path image wave title artist createdAt").lean()

    const response = {
      videoFiles: events.map((event) => ({
        id: event._id,
        photoUrl: event.photoUrl,
        title: event.title,
        createdAt: event.createdAt,
      })),
      musicFiles: musicFiles.map((music) => ({
        id: music._id,
        path: music.path,
        image: music.image,
        wave: music.wave,
        title: music.title,
        artist: music.artist,
        createdAt: music.createdAt,
      })),
      summary: {
        totalEvents: events.length,
        totalMusic: musicFiles.length,
        totalFiles: events.length + musicFiles.length,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get valid files error:", error)
    return NextResponse.json({ error: "Failed to get valid files" }, { status: 500 })
  }
}
