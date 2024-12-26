import { connectToDatabase } from "@/lib/database";
import Music from "@/lib/database/models/music.model";
import { handleError } from "@/lib/utils";
export async function GET(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const musics = await Music.find({});
    return new Response(JSON.stringify(musics), { status: 200 });
  } catch (error) {
    handleError(error);
  }
}
