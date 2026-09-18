import { NextResponse } from "next/server";
import { approveWork, approveOrderWork } from "@/lib/actions/user.actions";

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
    if (workId) {
      await approveWork(workId);
    } else {
      await approveOrderWork(orderId as string, resumeIndex);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
