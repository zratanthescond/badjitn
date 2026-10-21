import mongoose from "mongoose";
import Counter from "@/lib/database/models/counter.model";

// Permanent per-event submission number ("N° de soumission") stored on each
// EventWork. Unlike a list position it never changes: not with search filters,
// not when other works are added or removed. Numbers start at 1 for each event.
// EventWork is read from `mongoose.models` at call time because the model file
// itself registers a save hook that calls this module.

const counterId = (eventId: string) => `work:${String(eventId)}`;
const workModel = () => mongoose.models.EventWork;

/** Atomically reserves the next submission number for an event. */
export async function getNextWorkNumber(eventId: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId(eventId) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/**
 * Gives a number to works created before numbering existed, following the
 * collection's natural order (the order the admin list has always shown), after
 * the highest number already assigned. Safe to call repeatedly.
 */
export async function ensureWorkNumbers(eventId: string): Promise<void> {
  const EventWork = workModel();
  if (!EventWork) return;
  const missing = await EventWork.find(
    { eventId, submissionNumber: { $exists: false } },
    { _id: 1 }
  ).lean();
  if (missing.length === 0) return;

  const [highest] = await EventWork.find(
    { eventId, submissionNumber: { $exists: true } },
    { submissionNumber: 1 }
  )
    .sort({ submissionNumber: -1 })
    .limit(1)
    .lean();
  if (highest?.submissionNumber) {
    await Counter.updateOne(
      { _id: counterId(eventId) },
      { $max: { seq: highest.submissionNumber } },
      { upsert: true }
    );
  }

  for (const work of missing) {
    const submissionNumber = await getNextWorkNumber(eventId);
    await EventWork.updateOne(
      { _id: work._id, submissionNumber: { $exists: false } },
      { $set: { submissionNumber } }
    );
  }
}

/** Numbers legacy works first, then reserves a number for a new one. */
export async function allocateWorkNumber(eventId: string): Promise<number> {
  await ensureWorkNumbers(eventId);
  return getNextWorkNumber(eventId);
}
