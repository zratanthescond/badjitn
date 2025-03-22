import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./user.model";

// Define the TypeScript interface for Field
export interface IField extends Document {
  userId: mongoose.Types.ObjectId | IUser; // Reference to User model
  type: "text" | "number" | "select" | "radio";
  label: string;
  placeholder?: string;
  options?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Mongoose Schema
const FieldSchema: Schema<IField> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User relation
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "radio"],
    },
    label: { type: String, required: true },
    placeholder: { type: String, default: "" },
    options: { type: [String], default: [] },
  },
  { timestamps: true }
);

const FieldModel: Model<IField> =
  mongoose.models.Field || mongoose.model<IField>("Field", FieldSchema);
export default FieldModel;
