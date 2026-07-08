import mongoose, { Document, Schema, model, models } from "mongoose";
import { number, string } from "zod";

export interface IEvent extends Document {
  _id: any;
  title: string;
  description?: string;
  location?: {
    name: string;
    lon: number;
    lat: number;
  };
  city?: string;
  village?: string;
  jobTitleLabel?: string;
  selectedRepublic?: string;
  customRegistrationFields?: { label: string; isRequired: boolean }[];
  pricePlan?: {
    _id?: string;
    name: string;
    price: number;
    places?: number;
    note?: string;
    isPackage?: boolean;
    options?: { _id?: string; name: string; price: number; places?: number; description?: string; requireEmail?: boolean; registrationRequestOnly?: boolean }[];
  }[];
  pricePlanNote?: string;
  registrationFeeNote?: string;
  paymentMethods?: { card?: boolean; doorpay?: boolean; bankTransfer?: boolean; bankTransferAllowId?: boolean; bankTransferAllowScreenshot?: boolean };
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  isOnline?: boolean;
  sponsors?: string[];
  Sponsors?: any[];
  country?: string;
  requiredInfo?: string[];
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string; photo: string };
  organisation?: { _id: string; name: string; slug: string; logo: string };
  discount: {
    field: string;
    value: string;
    discount: number;
    discountType?: "percentage" | "fixed";
    discountTarget?: "all" | "inscription" | "plan";
    discountPlanIds?: string[];
    requireProof?: boolean;
    proofDescription?: string;
  };
  restricted: boolean;
  scanPoints?: string[];
  showWorkSubmissionPopup?: boolean;
  allowGuestRegistration?: boolean;
  disabledBaseFields?: string[];
  showProfileButton?: boolean;
  showReturnButton?: boolean;
  isFromOtherPlatform?: boolean;
}
const planOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  places: { type: Number },
  description: { type: String },
  requireEmail: { type: Boolean, default: false },
  registrationRequestOnly: { type: Boolean, default: false },
});

const pricePlanSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  places: { type: Number },
  note: { type: String },
  isPackage: { type: Boolean, default: false },
  options: { type: [planOptionSchema], default: [] },
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
  requiredInfo: { type: [String], default: [] },
  sponsors: { type: [String], default: [] },
  scanPoints: { type: [String], default: [] },
  pricePlan: { type: [pricePlanSchema], default: [] },
  pricePlanNote: { type: String },
  registrationFeeNote: { type: String },
  paymentMethods: {
    card: { type: Boolean, default: true },
    doorpay: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    bankTransferAllowId: { type: Boolean, default: false },
    bankTransferAllowScreenshot: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime: { type: Date, default: Date.now },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  country: { type: String },
  isOnline: { type: Boolean },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  organizer: { type: Schema.Types.ObjectId, ref: "User" },
  organisation: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  discount: {
    field: { type: String },
    value: { type: String },
    discount: { type: Number },
    discountType: { type: String, default: "percentage" },
    discountTarget: { type: String, default: "all" },
    discountPlanIds: { type: [String], default: [] },
    requireProof: { type: Boolean, default: false },
    proofDescription: { type: String },
  },
  restricted: { type: Boolean, default: false },
  showWorkSubmissionPopup: { type: Boolean, default: false },
  allowGuestRegistration: { type: Boolean, default: true },
  disabledBaseFields: { type: [String], default: [] },
  city: { type: String },
  village: { type: String },
  jobTitleLabel: { type: String },
  selectedRepublic: { type: String },
  customRegistrationFields: [{
    label: { type: String },
    isRequired: { type: Boolean, default: false }
  }],
  showProfileButton: { type: Boolean, default: true },
  showReturnButton: { type: Boolean, default: true },
  isFromOtherPlatform: { type: Boolean, default: false },
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
