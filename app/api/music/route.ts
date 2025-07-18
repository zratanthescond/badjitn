import { connectToDatabase } from "@/lib/database";
import Music from "@/lib/database/models/music.model";
import { handleError } from "@/lib/utils";

export const revalidate = 0;

export async function GET(req: Request, res: Response) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : 10;
  const searchQuery = searchParams.get("searchQuery") || "";

  try {
    await connectToDatabase();

    const searchFilter = searchQuery
      ? {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { artist: { $regex: searchQuery, $options: "i" } },
            { album: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    // Get one extra item to check if there's a next page
    const musics = await Music.find(searchFilter)
      .skip(skip)
      .limit(limit + 1)
      .sort({ createdAt: -1 });

    // Check if there's a next page
    const hasNextPage = musics.length > limit;

    // Remove the extra item if it exists
    if (hasNextPage) {
      musics.pop();
    }

    const response = {
      data: musics,
      hasNextPage,
      currentPage: page,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
    return new Response(JSON.stringify({ error: "Failed to fetch music" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
