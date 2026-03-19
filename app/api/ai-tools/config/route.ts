import { readAIToolConfig } from "@/lib/ai-tool-config";
import { handleError } from "@/lib/utils";

export const revalidate = 0;

export async function GET() {
  try {
    const config = await readAIToolConfig();

    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);

    return new Response(JSON.stringify({ error: "Failed to fetch AI tool config" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
