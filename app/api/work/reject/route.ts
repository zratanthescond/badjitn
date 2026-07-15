import { NextResponse } from "next/server";
import { rejectWork } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workId = body.workId as string;
    const reason = body.reason as string | undefined;
    if (!workId) {
      return NextResponse.json(
        { success: false, error: "workId is required" },
        { status: 400 }
      );
    }
    await rejectWork(workId, reason);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rejection failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
