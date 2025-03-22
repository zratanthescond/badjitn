import mongoose, { Schema, type Document, type Model } from "mongoose";

// Interface for the Comment document
export interface IComment extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  parentId: mongoose.Types.ObjectId | null; // For replies
  eventId: mongoose.Types.ObjectId; // ID of the post this comment belongs to
}

// Create the Comment schema
const CommentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likesCount: { type: Number, default: 0 },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  },
  {
    timestamps: true,
  }
);

// Create or get the Comment model
let Comment: Model<IComment>;

try {
  // Try to get the existing model
  Comment = mongoose.model<IComment>("Comment");
} catch {
  // If the model doesn't exist, create it
  Comment = mongoose.model<IComment>("Comment", CommentSchema);
}

export { Comment };
