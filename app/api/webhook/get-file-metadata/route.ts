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
      return NextResponse.json({
        metadata: null,
        error: "File path is required",
      })
    }

    await connectToDatabase()

    const event = await Event.findOne({
      $or: [
        { photoUrl: { $regex: filePath, $options: "i" } },
        { photoUrl: filePath },
        { photoUrl: `/${filePath}` },
        { photoUrl: `http://localhost:4000/${filePath}` },
      ],
    }).lean()

    const music = await Music.findOne({
      $or: [
        { path: { $regex: filePath, $options: "i" } },
        { image: { $regex: filePath, $options: "i" } },
        { wave: { $regex: filePath, $options: "i" } },
        { path: filePath },
        { image: filePath },
        { wave: filePath },
      ],
    }).lean()

    let metadata = null

    if (event) {
      metadata = {
        type: "video",
        id: event._id,
        title: event.title,
        description: event.description,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        photoUrl: event.photoUrl,
        collection: "events",
      }
    } else if (music) {
      metadata = {
        type: "audio",
        id: music._id,
        title: music.title,
        artist: music.artist,
        album: music.album,
        path: music.path,
        image: music.image,
        wave: music.wave,
        createdAt: music.createdAt,
        updatedAt: music.updatedAt,
        collection: "music",
      }
    }

    return NextResponse.json({
      metadata,
      found: !!metadata,
    })
  } catch (error) {
    console.error("Get file metadata error:", error)
    return NextResponse.json({
      metadata: null,
      error: "Failed to get file metadata",
    })
  }
}
