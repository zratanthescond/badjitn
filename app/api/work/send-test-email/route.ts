import { NextResponse } from "next/server";
import { sendWorkTestEmail, type WorkEmailConfig } from "@/lib/actions/user.actions";

const pickString = (value: unknown, max = 5000) =>
  typeof value === "string" ? value.slice(0, max) : undefined;

/**
 * Sends the composed résumé email to a single test address. Exposed as a
 * route (not a server action) so a page loaded before a deployment keeps
 * working: server action ids change with every build and stale tabs get
 * "Server Action ... was not found on the server".
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventId = pickString(body.eventId, 64);
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }
    const config: WorkEmailConfig = {
      subject: pickString(body.subject, 200),
      message: pickString(body.message),
      extraLine: pickString(body.extraLine, 1000),
    };
    const result = await sendWorkTestEmail({
      eventId,
      to: pickString(body.to, 320),
      config,
      summaryStatus: pickString(body.summaryStatus, 32),
      summaryTitle: pickString(body.summaryTitle, 500),
    });
    return NextResponse.json({ success: true, email: result.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Test email failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
