import mongoose, { Document } from "mongoose";

/**
 * Report Schema
 * This schema represents a report made by a user about an event.
 *
 * Fields:
 * - userId: The ID of the user who created the report (references User model).
 * - eventId: The ID of the event being reported (references Event model).
 * - cause: The reason why the event is being reported.
 * - status: The current state of the report (pending, reviewed, resolved).
 * - timestamps: Automatically manages createdAt and updatedAt fields.
 */

interface IReport extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  eventId: mongoose.Schema.Types.ObjectId;
  cause: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<IReport>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    cause: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);
export default Report;
