import { NextResponse } from "next/server";
import { rejectWork, rejectOrderWork } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const workId = body.workId as string | undefined;
    const orderId = body.orderId as string | undefined;
    const reason = body.reason as string | undefined;
    if (!workId && !orderId) {
      return NextResponse.json(
        { success: false, error: "workId or orderId is required" },
        { status: 400 }
      );
    }
    if (workId) {
      await rejectWork(workId, reason);
    } else {
      await rejectOrderWork(orderId as string, reason);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rejection failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
