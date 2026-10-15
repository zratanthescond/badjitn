import { Schema, model, models, Document } from "mongoose";

// Generic atomic sequence store. Used to hand out per-event registration
// numbers (`order:<eventId>`) without races between concurrent sign-ups.
export interface ICounter extends Document {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

const Counter = models.Counter || model<ICounter>("Counter", CounterSchema);

export default Counter;
