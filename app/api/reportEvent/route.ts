import { getEventById } from "@/lib/actions/event.actions";
import { getUserById, reportEvent } from "@/lib/actions/user.actions";

export async function POST(req: Request, res: Response) {
  const data = await req.json();
  console.log(data);
  const event = getEventById(data.eventId);
  if (!event)
    return new Response(JSON.stringify({ error: "Event not found" }), {
      status: 400,
    });
  const user = await getUserById(data.userId);
  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 400,
    });
  const cause = data.cause;
  if (cause.length === 0)
    return new Response(JSON.stringify({ error: "Cause not found" }), {
      status: 400,
    });
  const report = await reportEvent(data.eventId, cause, data.userId);
  return new Response(JSON.stringify(report), { status: 200 });
}
