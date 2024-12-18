import { connectToDatabase } from "@/lib/database";
import Music from "@/lib/database/models/music.model";
export async function GET(req: Request, res: Response) {
  await connectToDatabase();
  const musics = await Music.find({});
  return new Response(JSON.stringify(musics), { status: 200 });
}
