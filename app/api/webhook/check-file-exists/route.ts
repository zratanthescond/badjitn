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

    const eventExists = await Event.exists({
      $or: [
        { photoUrl: { $regex: filePath, $options: "i" } },
        { photoUrl: filePath },
        { photoUrl: `/${filePath}` },
        { photoUrl: `http://localhost:4000/${filePath}` },
        { photoUrl: `https://yourdomain.com/${filePath}` },
      ],
    })

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
      ],
    })

    const exists = !!(eventExists || musicExists)

    return NextResponse.json({
      exists,
      foundIn: {
        events: !!eventExists,
        music: !!musicExists,
      },
    })
  } catch (error) {
    console.error("Check file exists error:", error)
    return NextResponse.json({ error: "Failed to check file existence" }, { status: 500 })
  }
}
