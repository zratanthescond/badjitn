import { Schema, model, models, Document } from "mongoose";

export interface ICertificate extends Document {
  userId: Schema.Types.ObjectId;
  eventId: Schema.Types.ObjectId;
  status: "pending" | "rejected" | "approved";
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
      required: true,
    },
    approvedAt: { type: Date },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

// Ensure `models.Certificate` exists before creating a new model
const Certificate =
  models?.Certificate || model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
