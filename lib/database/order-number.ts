import Counter from "@/lib/database/models/counter.model";
import Order from "@/lib/database/models/order.model";

// Per-event sequential registration number ("numéro d'inscription").
// Numbers start at 1 for each event and follow creation order.

const counterId = (eventId: string) => `order:${String(eventId)}`;

/** Atomically reserves the next registration number for an event. */
export async function getNextOrderNumber(eventId: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId(eventId) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/**
 * Backfills registration numbers for orders created before this feature
 * existed. Orders without a number get one in chronological order, continuing
 * after the highest number already assigned. Safe to call repeatedly.
 */
export async function ensureOrderNumbers(eventId: string): Promise<void> {
  const missing = await Order.find(
    { event: eventId, orderNumber: { $exists: false } },
    { _id: 1 }
  )
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  if (missing.length === 0) return;

  // Make sure the counter is at least as high as any existing number so the
  // backfill never collides with orders that already have one.
  const [highest] = await Order.find(
    { event: eventId, orderNumber: { $exists: true } },
    { orderNumber: 1 }
  )
    .sort({ orderNumber: -1 })
    .limit(1)
    .lean();
  if (highest?.orderNumber) {
    await Counter.updateOne(
      { _id: counterId(eventId) },
      { $max: { seq: highest.orderNumber } },
      { upsert: true }
    );
  }

  for (const order of missing) {
    const orderNumber = await getNextOrderNumber(eventId);
    await Order.updateOne(
      { _id: order._id, orderNumber: { $exists: false } },
      { $set: { orderNumber } }
    );
  }
}

/** Backfills legacy orders, then reserves a number for a new one. */
export async function allocateOrderNumber(eventId: string): Promise<number> {
  await ensureOrderNumbers(eventId);
  return getNextOrderNumber(eventId);
}
