import { Schema, model, models, Document } from "mongoose";

export interface ICertificateElement {
  id: string;
  type: "text" | "shape" | "image" | "qr";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  rotation?: number;
  imageUrl?: string;
  qrData?: string;
  qrFgColor?: string;
}

export interface ICertificateTemplate extends Document {
  eventId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  elements: ICertificateElement[];
  backgroundImage?: string;
  orientation: "portrait" | "landscape";
  // Design used when a participant's certification request is approved.
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateElementSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ["text", "shape", "image", "qr"] },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  content: { type: String },
  fontSize: { type: Number },
  fontWeight: { type: String },
  fontFamily: { type: String },
  fontStyle: { type: String },
  textDecoration: { type: String },
  letterSpacing: { type: Number },
  textAlign: { type: String, enum: ["left", "center", "right"] },
  color: { type: String },
  backgroundColor: { type: String },
  borderRadius: { type: Number },
  rotation: { type: Number },
  imageUrl: { type: String },
  qrData: { type: String },
  qrFgColor: { type: String },
});

const CertificateTemplateSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    elements: [CertificateElementSchema],
    backgroundImage: { type: String },
    orientation: { type: String, enum: ["portrait", "landscape"], default: "landscape" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CertificateTemplate =
  models.CertificateTemplate || model<ICertificateTemplate>("CertificateTemplate", CertificateTemplateSchema);

export default CertificateTemplate;
