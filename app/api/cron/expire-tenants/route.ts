import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Tenant from "@/lib/database/models/tenant.model";

// Called once a day (external scheduler, same x-cron-secret convention as process-invitations).
// Moves client subscriptions whose end date has passed to "expired", which makes their
// back office read-only and blocks event creation. "suspended" is a manual state and is left alone.
export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const result = await Tenant.updateMany(
      { "subscription.status": { $in: ["trial", "active"] }, "subscription.endsAt": { $lt: new Date() } },
      { $set: { "subscription.status": "expired" } }
    );
    return NextResponse.json({ success: true, expired: result.modifiedCount });
  } catch (error) {
    console.error("expire-tenants cron error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
