import { NextResponse } from "next/server";
import { resendRegistrationEmail } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventId = body.eventId as string | undefined;
    const userId = body.userId as string | undefined;
    const orderId = body.orderId as string | undefined;
    if (!eventId || (!userId && !orderId)) {
      return NextResponse.json(
        { success: false, error: "eventId and (userId or orderId) are required" },
        { status: 400 }
      );
    }
    const result = await resendRegistrationEmail({ eventId, userId, orderId });
    return NextResponse.json({ success: true, email: result?.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Email sending failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
