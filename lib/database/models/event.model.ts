import mongoose, { Document, Schema, model, models } from "mongoose";
import { number, string } from "zod";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: {
    name: string;
    lon: number;
    lat: number;
  };
  pricePlan?: {
    name: string;
    price: number;
  }[];
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  isOnline?: boolean;
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
}
const pricePlanSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
});
const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: {
    name: {
      type: String,
      trim: true,
    },
    lon: {
      type: Number,
    },
    lat: {
      type: Number,
    },
  },
  pricePlan: { type: [pricePlanSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime: { type: Date, default: Date.now },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  isOnline: { type: Boolean },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  organizer: { type: Schema.Types.ObjectId, ref: "User" },
});
EventSchema.virtual("Sponsors", {
  ref: "Sponsor",
  localField: "_id",
  foreignField: "eventId",
  match: {
    toDate: { $gte: Date.now() },
  },
});
EventSchema.set("toObject", { virtuals: true });
EventSchema.set("toJSON", { virtuals: true });
const Event = models.Event || model("Event", EventSchema);

export default Event;
