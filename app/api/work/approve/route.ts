import { NextResponse } from "next/server";
import { approveWork } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workId = body.workId as string;
    if (!workId) {
      return NextResponse.json(
        { success: false, error: "workId is required" },
        { status: 400 }
      );
    }
    await approveWork(workId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
