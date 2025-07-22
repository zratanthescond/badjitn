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

    const [eventStats, musicStats, deletedEvents, deletedMusic, oldestEvent, newestEvent, oldestMusic, newestMusic] =
      await Promise.all([
        Event.countDocuments({ deleted: { $ne: true } }),
        Music.countDocuments({ deleted: { $ne: true } }),
        Event.countDocuments({ deleted: true }),
        Music.countDocuments({ deleted: true }),
        Event.findOne({ deleted: { $ne: true } })
          .sort({ createdAt: 1 })
          .select("createdAt title")
          .lean(),
        Event.findOne({ deleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .select("createdAt title")
          .lean(),
        Music.findOne({ deleted: { $ne: true } })
          .sort({ createdAt: 1 })
          .select("createdAt title")
          .lean(),
        Music.findOne({ deleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .select("createdAt title")
          .lean(),
      ])

    const oldestFile = [oldestEvent, oldestMusic]
      .filter(Boolean)
      .sort((a, b) => new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime())[0]

    const newestFile = [newestEvent, newestMusic]
      .filter(Boolean)
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime())[0]

    const stats = {
      totalEvents: eventStats,
      totalMusic: musicStats,
      totalFiles: eventStats + musicStats,
      deletedFiles: deletedEvents + deletedMusic,
      deletedEvents,
      deletedMusic,
      oldestFile: oldestFile
        ? {
            title: oldestFile.title,
            createdAt: oldestFile.createdAt,
          }
        : null,
      newestFile: newestFile
        ? {
            title: newestFile.title,
            createdAt: newestFile.createdAt,
          }
        : null,
      estimatedSize: (eventStats + musicStats) * 50 * 1024 * 1024,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get database stats error:", error)
    return NextResponse.json({ error: "Failed to get database stats" }, { status: 500 })
  }
}
