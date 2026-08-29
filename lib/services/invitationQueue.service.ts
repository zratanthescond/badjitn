import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import { sendInvitationEmail } from "@/lib/mail";

function buildRegistrationUrl(eventId: string) {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return `${serverUrl.replace(/\/$/, "")}/events/${eventId}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type QueueBatchResult = {
  processedEvents: number;
  sent: number;
  failed: number;
  quotaDeferred: number;
  remaining: number;
};

function isQuotaError(err: any) {
  const text = `${err?.response || ""} ${err?.message || ""}`.toLowerCase();
  return (
    text.includes("quota exceeded") ||
    text.includes("exceeded the limit") ||
    text.includes("too many mails") ||
    text.includes("too many messages")
  );
}

// Sends up to `maxTotal` queued invitations across all events, oldest-queued first,
// pacing sends with `delayMs` between each. Meant to be called on a schedule (e.g. every
// 5 min with maxTotal ~8) so the account stays comfortably under the mail provider's
// hourly send limit — OVH mutualisé caps contact@badgi.net at 200 msgs/hour/account,
// which is what caused mass "Échoué" results when the whole list was sent in one go.
export async function processInvitationQueueBatch({
  maxTotal = 8,
  delayMs = 1500,
}: { maxTotal?: number; delayMs?: number } = {}): Promise<QueueBatchResult> {
  await connectToDatabase();

  const events = await Event.find({ "invitationQueue.0": { $exists: true } }).select(
    "_id title imageUrl invitationEmail invitationQueue invitedEmails"
  );

  let sent = 0;
  let failed = 0;
  let quotaDeferred = 0;
  let remainingBudget = maxTotal;
  let processedEvents = 0;
  let quotaHit = false;

  for (const event of events) {
    if (remainingBudget <= 0 || quotaHit) break;
    const queue = event.invitationQueue || [];
    if (queue.length === 0) continue;
    processedEvents++;

    const registrationUrl = buildRegistrationUrl(String(event._id));
    const subject = event.invitationEmail?.subject || `Invitation — ${event.title}`;
    const template = {
      headerImageUrl: event.invitationEmail?.headerImageUrl || event.imageUrl,
      bodyHtml: event.invitationEmail?.bodyHtml,
      buttonLabel: event.invitationEmail?.buttonLabel,
      buttonUrl: registrationUrl,
      footerText: event.invitationEmail?.footerText,
      footerPhone: event.invitationEmail?.footerPhone,
      footerEmail: event.invitationEmail?.footerEmail,
    };

    const invitedSet = new Set(
      (event.invitedEmails || []).map((e: string) => e.toLowerCase())
    );
    const batch = queue.slice(0, remainingBudget);

    for (const recipient of batch) {
      remainingBudget--;

      if (invitedSet.has(recipient.email.toLowerCase())) {
        // Already sent through another path since being queued — just drop it.
        await Event.findByIdAndUpdate(event._id, {
          $pull: { invitationQueue: { email: recipient.email } },
        });
        continue;
      }

      let status: "sent" | "failed";
      let errorMessage: string | undefined;
      try {
        await sendInvitationEmail({ to: recipient.email, subject, template });
        status = "sent";
        sent++;
      } catch (err: any) {
        if (isQuotaError(err)) {
          // The provider's hourly quota is exhausted for this run — leave this
          // recipient (and the rest of the batch) queued untouched and stop
          // early rather than burning through them as false "failed" entries.
          quotaDeferred++;
          quotaHit = true;
          break;
        }
        status = "failed";
        errorMessage = err?.response || err?.message || String(err);
        failed++;
      }

      const update: any = {
        $push: {
          invitationLog: {
            email: recipient.email,
            firstName: recipient.firstName || "",
            lastName: recipient.lastName || "",
            status,
            errorMessage,
          },
        },
        $pull: { invitationQueue: { email: recipient.email } },
      };
      if (status === "sent") {
        update.$addToSet = { invitedEmails: recipient.email };
      }
      await Event.findByIdAndUpdate(event._id, update);

      if (remainingBudget > 0) {
        await sleep(delayMs);
      }
    }
  }

  const remainingAgg = await Event.aggregate([
    { $match: { "invitationQueue.0": { $exists: true } } },
    { $project: { count: { $size: "$invitationQueue" } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);

  return {
    processedEvents,
    sent,
    failed,
    quotaDeferred,
    remaining: remainingAgg[0]?.total || 0,
  };
}
