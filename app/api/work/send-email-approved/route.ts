import { NextResponse } from "next/server";
import {
  sendEmailToApprovedWorks,
  type WorkEmailConfig,
} from "@/lib/actions/user.actions";

const pickString = (value: unknown, max = 5000) =>
  typeof value === "string" ? value.slice(0, max) : undefined;

/** Bulk email to every approved résumé of an event (see send-test-email for why a route). */
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
    const result = await sendEmailToApprovedWorks({ eventId, config });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bulk email failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
