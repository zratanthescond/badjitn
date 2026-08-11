import mongoose from "mongoose";

export interface IClientInfo {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  republic?: string;
  city?: string;
  village?: string;
  // Abstract-specific fields (auteur principal = firstName/lastName above)
  thematique?: string;
  coAuthors?: string;
  affiliation?: string;
  correspondenceEmail?: string;
}

interface IEventWork extends mongoose.Document {
  _id: any;
  eventId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  title?: string;
  clientInfo?: IClientInfo;
  note?: string;
  summaryStatus: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  // Abstract document(s) uploaded alongside the submission (pdf/doc/image); available immediately.
  abstractFileUrls: string[];
  // Final e-poster upload; only unlocked once the abstract has been approved.
  fileUrls: string[];
  createdAt: Date;
  updatedAt: Date;
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
      thematique: String,
      coAuthors: String,
      affiliation: String,
      correspondenceEmail: String,
    },
    required: false,
  },
  note: { type: String, required: false },
  summaryStatus: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft",
  },
  submittedAt: { type: Date, required: false },
  approvedAt: { type: Date, required: false },
  rejectedAt: { type: Date, required: false },
  rejectionReason: { type: String, required: false },
  abstractFileUrls: {
    type: [String],
    default: [],
  },
  fileUrls: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

eventWorkSchema.index({ eventId: 1, userId: 1 });
eventWorkSchema.index({ eventId: 1, userId: 1, summaryStatus: 1 });

const EventWork =
  mongoose.models.EventWork ||
  mongoose.model<IEventWork>("EventWork", eventWorkSchema);
export default EventWork;
