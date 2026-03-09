import mongoose from "mongoose";

export interface IClientInfo {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  republic?: string;
  city?: string;
  village?: string;
}

interface IEventWork extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  eventId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  title?: string;
  clientInfo?: IClientInfo;
  note?: string;
  summaryStatus: "draft" | "submitted" | "approved";
  submittedAt?: Date;
  approvedAt?: Date;
  fileUrls: string[];
  createdAt: Date;
}

const eventWorkSchema = new mongoose.Schema<IEventWork>({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: false },
  clientInfo: {
    type: {
      firstName: String,
      lastName: String,
      jobTitle: String,
      republic: String,
      city: String,
      village: String,
    },
    required: false,
  },
  note: { type: String, required: false },
  summaryStatus: {
    type: String,
    enum: ["draft", "submitted", "approved"],
    default: "draft",
  },
  submittedAt: { type: Date, required: false },
  approvedAt: { type: Date, required: false },
  fileUrls: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventWork =
  mongoose.models.EventWork ||
  mongoose.model<IEventWork>("EventWork", eventWorkSchema);
export default EventWork;
