import { readAIToolConfig } from "@/lib/ai-tool-config";
import { handleError } from "@/lib/utils";
import { useUser } from "@/lib/actions/user.actions";

export const revalidate = 0;

export async function GET() {
  try {
    const user = await useUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const config = await readAIToolConfig();

    if (user.role !== "admin" && config && config.userAccess) {
      const userEmail = user.email?.toLowerCase();
      config.userAccess = config.userAccess.filter(
        (entry: { email: string }) => entry.email?.toLowerCase() === userEmail
      );
    }

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
