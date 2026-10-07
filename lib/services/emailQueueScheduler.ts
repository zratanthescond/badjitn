import { processInvitationQueueBatch } from "@/lib/services/invitationQueue.service";
import { processCertificateEmailQueueBatch } from "@/lib/services/certificateQueue.service";

// In-process fallback for the external cron that is supposed to hit
// /api/cron/process-invitations every 5 minutes. That cron silently stopped once
// (certificates and invitations sat "En file d'attente" for days), so the server now
// drains both queues itself at the same cadence and batch sizes. Rate limiting
// (OVH: 200 msgs/hour) is still enforced by the per-run caps in the queue services.
const INTERVAL_MS = 5 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 30 * 1000;

declare global {
  // Survives HMR module re-evaluation in dev so we never stack several timers.
  // eslint-disable-next-line no-var
  var __emailQueueSchedulerTimer: NodeJS.Timeout | undefined;
}

let running = false;

export async function drainEmailQueuesOnce() {
  // Skip a tick while the previous one (or a manual cron call) is still sending.
  if (running) return;
  running = true;
  try {
    const invitations = await processInvitationQueueBatch();
    const certificates = await processCertificateEmailQueueBatch();
    const total = invitations.sent + invitations.failed + certificates.sent + certificates.failed;
    if (total > 0 || invitations.remaining > 0 || certificates.remaining > 0) {
      console.log("[emailQueueScheduler] invitations:", invitations, "certificates:", certificates);
    }
  } catch (error) {
    console.error("[emailQueueScheduler] run failed:", error);
  } finally {
    running = false;
  }
}

export function startEmailQueueScheduler() {
  if (process.env.DISABLE_EMAIL_QUEUE_SCHEDULER === "true") return;
  if (globalThis.__emailQueueSchedulerTimer) return;

  const first = setTimeout(() => {
    void drainEmailQueuesOnce();
    const timer = setInterval(() => void drainEmailQueuesOnce(), INTERVAL_MS);
    timer.unref();
    globalThis.__emailQueueSchedulerTimer = timer;
  }, FIRST_RUN_DELAY_MS);
  first.unref();
  globalThis.__emailQueueSchedulerTimer = first;
  console.log(`[emailQueueScheduler] started (every ${INTERVAL_MS / 60000} min)`);
}
