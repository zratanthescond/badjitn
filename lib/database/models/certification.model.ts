import { Schema, model, models, Document } from "mongoose";

export interface ICertificate extends Document {
  // Set for self-requested certificates and for recipients who have an account.
  userId?: Schema.Types.ObjectId;
  eventId: Schema.Types.ObjectId;
  status: "pending" | "rejected" | "approved";
  source: "request" | "issued";
  templateId?: Schema.Types.ObjectId;
  orderId?: Schema.Types.ObjectId;
  recipientName?: string;
  // Stored lowercased: lets someone who signs up later with this email find it.
  recipientEmail?: string;
  emailStatus: "none" | "queued" | "sent" | "failed";
  emailQueuedAt?: Date;
  emailSentAt?: Date;
  emailError?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
      required: true,
    },
    source: { type: String, enum: ["request", "issued"], default: "request" },
    templateId: { type: Schema.Types.ObjectId, ref: "CertificateTemplate", required: false },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: false },
    recipientName: { type: String },
    recipientEmail: { type: String, lowercase: true, trim: true, index: true },
    emailStatus: {
      type: String,
      enum: ["none", "queued", "sent", "failed"],
      default: "none",
    },
    emailQueuedAt: { type: Date },
    emailSentAt: { type: Date },
    emailError: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

const Certificate =
  models?.Certificate || model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
