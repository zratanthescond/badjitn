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
    cardsLayout?: boolean;
    groupedWithPlanId?: string;
    displayPriceLabel?: string;
    options?: { _id?: string; name: string; price: number; places?: number; description?: string; requireEmail?: boolean; registrationRequestOnly?: boolean; requireProof?: boolean; proofDescription?: string; proofFallbackPrice?: number }[];
  }[];
  pricePlanNote?: string;
  registrationFeeNote?: string;
  paymentMethods?: { card?: boolean; doorpay?: boolean; bankTransfer?: boolean; bankTransferAllowId?: boolean; bankTransferAllowScreenshot?: boolean; residentsOnly?: boolean };
  bankInfo?: { bankName?: string; accountHolder?: string; rib?: string };
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
    value: string | string[];
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
  maxWorkSubmissions?: number;
  workAbstractConfig?: {
    allowCoAuthors?: boolean;
    sections?: { label: string; wordLimit?: number }[];
    totalWordLimit?: number;
  };
  allowGuestRegistration?: boolean;
  disabledBaseFields?: string[];
  showProfileButton?: boolean;
  showReturnButton?: boolean;
  isFromOtherPlatform?: boolean;
  invitationEmail?: {
    subject?: string;
    headerImageUrl?: string;
    bodyHtml?: string;
    buttonLabel?: string;
    footerText?: string;
    footerPhone?: string;
    footerEmail?: string;
  };
  invitedEmails?: string[];
  invitationLog?: {
    email: string;
    firstName?: string;
    lastName?: string;
    status: "sent" | "failed";
    errorMessage?: string;
    sentAt: Date;
  }[];
  invitationQueue?: {
    email: string;
    firstName?: string;
    lastName?: string;
    queuedAt: Date;
  }[];
}
const planOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  places: { type: Number },
  description: { type: String },
  requireEmail: { type: Boolean, default: false },
  registrationRequestOnly: { type: Boolean, default: false },
  requireProof: { type: Boolean, default: false },
  proofDescription: { type: String },
  // If set, an admin who rejects the uploaded proof bills the registrant this
  // amount instead (e.g. the standard rate, when a student/resident claim fails
  // verification) — mirrors the existing discount-eligibility fallback billing.
  proofFallbackPrice: { type: Number },
});

const pricePlanSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  places: { type: Number },
  note: { type: String },
  isPackage: { type: Boolean, default: false },
  // When true, this plan's options are rendered as horizontal cards (with each
  // option's description shown as an "Incluant" block) instead of the compact list.
  cardsLayout: { type: Boolean, default: false },
  // When set, this whole plan is rendered as an extra card inside the cardsLayout
  // row of the referenced plan, as an independent toggle (not mutually exclusive
  // with that plan's own options) — e.g. a "Pré-congrès" add-on next to a base fee.
  groupedWithPlanId: { type: String },
  // Optional text shown instead of the computed price on a grouped card (e.g. an
  // all-inclusive headline price while the actual add-on charge is a supplement).
  displayPriceLabel: { type: String },
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
    // When true, bank transfer & "prise en charge laboratoire" are only offered
    // to participants whose declared country of residence is Tunisia; other
    // participants only see the "paiement sur place" (doorpay) option.
    residentsOnly: { type: Boolean, default: false },
  },
  bankInfo: {
    bankName: { type: String },
    accountHolder: { type: String },
    rib: { type: String },
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
    // String for a single qualifying value, or an array when several field
    // choices (e.g. "Résident en médecine" and "Professionnel de santé")
    // should share the same discounted tariff.
    value: { type: Schema.Types.Mixed },
    discount: { type: Number },
    discountType: { type: String, default: "percentage" },
    discountTarget: { type: String, default: "all" },
    discountPlanIds: { type: [String], default: [] },
    requireProof: { type: Boolean, default: false },
    proofDescription: { type: String },
  },
  restricted: { type: Boolean, default: false },
  showWorkSubmissionPopup: { type: Boolean, default: false },
  maxWorkSubmissions: { type: Number },
  workAbstractConfig: {
    allowCoAuthors: { type: Boolean, default: false },
    sections: {
      type: [{
        label: { type: String },
        wordLimit: { type: Number },
      }],
      default: undefined,
    },
    totalWordLimit: { type: Number },
  },
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
  invitationEmail: {
    subject: { type: String },
    headerImageUrl: { type: String },
    bodyHtml: { type: String },
    buttonLabel: { type: String },
    footerText: { type: String },
    footerPhone: { type: String },
    footerEmail: { type: String },
  },
  invitedEmails: { type: [String], default: [] },
  invitationLog: {
    type: [
      {
        email: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        status: { type: String, enum: ["sent", "failed"], default: "sent" },
        errorMessage: { type: String },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  invitationQueue: {
    type: [
      {
        email: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        queuedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
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
