import mongoose from "mongoose";

interface IEventWork extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  eventId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  fileUrls: string[];
  note?: string;
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
  fileUrls: {
    type: [String],
    required: true,
  },
  note: {
    type: String,
    required: false,
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
