import { connectToDatabase } from "@/lib/database";
import Certificate from "@/lib/database/models/certification.model";
import CertificateTemplate from "@/lib/database/models/certificate-template.model";
import Event from "@/lib/database/models/event.model";
import { sendCertificateEmail } from "@/lib/mail";
import { certificateVerifyUrl } from "@/lib/certificate-render";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(err: any) {
  const text = `${err?.response || ""} ${err?.message || ""}`.toLowerCase();
  return (
    text.includes("quota exceeded") ||
    text.includes("exceeded the limit") ||
    text.includes("too many mails") ||
    text.includes("too many messages")
  );
}

export type CertificateQueueResult = { sent: number; failed: number; quotaDeferred: number; remaining: number };

// Shares the SMTP account with the invitation queue (OVH: 200 msgs/hour), so each
// cron run only sends a handful — see invitationQueue.service.ts.
export async function processCertificateEmailQueueBatch({
  maxTotal = 6,
  delayMs = 1500,
}: { maxTotal?: number; delayMs?: number } = {}): Promise<CertificateQueueResult> {
  await connectToDatabase();

  const batch = await Certificate.find({ emailStatus: "queued", recipientEmail: { $exists: true, $ne: "" } })
    .sort({ emailQueuedAt: 1 })
    .limit(maxTotal);

  const eventIds = Array.from(new Set(batch.map((c: any) => String(c.eventId))));
  const templateIds = Array.from(new Set(batch.map((c: any) => String(c.templateId)).filter(Boolean)));
  const [events, templates] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }, { title: 1 }).lean(),
    CertificateTemplate.find({ _id: { $in: templateIds } }, { name: 1 }).lean(),
  ]);
  const eventTitle = new Map(events.map((e: any) => [String(e._id), e.title]));
  const templateName = new Map(templates.map((t: any) => [String(t._id), t.name]));

  let sent = 0;
  let failed = 0;
  let quotaDeferred = 0;

  for (let i = 0; i < batch.length; i++) {
    const certificate: any = batch[i];
    try {
      await sendCertificateEmail({
        to: certificate.recipientEmail,
        recipientName: certificate.recipientName || "",
        eventTitle: eventTitle.get(String(certificate.eventId)) || "",
        certificateTypeName: templateName.get(String(certificate.templateId)) || "Certificat",
        certificateUrl: certificateVerifyUrl(String(certificate._id)),
      });
      certificate.emailStatus = "sent";
      certificate.emailSentAt = new Date();
      certificate.emailError = undefined;
      sent++;
    } catch (err: any) {
      if (isQuotaError(err)) {
        // Leave it queued for the next run instead of marking it failed.
        quotaDeferred = batch.length - i;
        break;
      }
      certificate.emailStatus = "failed";
      certificate.emailError = String(err?.response || err?.message || err).slice(0, 500);
      failed++;
    }
    await certificate.save();
    if (i < batch.length - 1) await sleep(delayMs);
  }

  const remaining = await Certificate.countDocuments({ emailStatus: "queued" });
  return { sent, failed, quotaDeferred, remaining };
}
