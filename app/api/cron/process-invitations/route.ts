import { type NextRequest, NextResponse } from "next/server";
import { processInvitationQueueBatch } from "@/lib/services/invitationQueue.service";

// Called on a schedule (e.g. every 5 minutes) to drain the invitation queue a few
// emails at a time, keeping the SMTP account under its hourly send limit. See
// lib/services/invitationQueue.service.ts for the rate-limiting rationale.
export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processInvitationQueueBatch();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("process-invitations cron error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
