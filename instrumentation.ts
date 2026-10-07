// Runs once when the Next.js server starts (not during `next build`).
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startEmailQueueScheduler } = await import("@/lib/services/emailQueueScheduler");
  startEmailQueueScheduler();
}
