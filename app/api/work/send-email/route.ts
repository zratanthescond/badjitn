import { NextResponse } from "next/server";
import {
  resendWorkSubmissionEmail,
  type WorkEmailConfig,
} from "@/lib/actions/user.actions";

const pickString = (value: unknown, max = 5000) =>
  typeof value === "string" ? value.slice(0, max) : undefined;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workId = body.workId as string | undefined;
    const orderId = body.orderId as string | undefined;
    const resumeIndex = body.resumeIndex as number | undefined;
    if (!workId && !orderId) {
      return NextResponse.json(
        { success: false, error: "workId or orderId is required" },
        { status: 400 }
      );
    }
    const config: WorkEmailConfig = {
      subject: pickString(body.subject, 200),
      message: pickString(body.message),
      extraLine: pickString(body.extraLine, 1000),
    };
    const result = await resendWorkSubmissionEmail({
      workId,
      orderId,
      resumeIndex,
      config,
    });
    return NextResponse.json({ success: true, email: result?.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Email sending failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
