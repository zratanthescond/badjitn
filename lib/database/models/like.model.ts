import mongoose, { Schema, type Document, type Model } from "mongoose";

// Define the types of content that can be liked
export enum LikeableType {
  POST = "Event",
  COMMENT = "Comment",
}

// Interface for the Like document
export interface ILike extends Document {
  userId: string;
  likeableId: mongoose.Types.ObjectId;
  likeableType: LikeableType;
  createdAt: Date;
}

// Create the Like schema
const LikeSchema = new Schema<ILike>({
  userId: { type: String, required: true },
  likeableId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "likeableType",
  },
  likeableType: {
    type: String,
    required: true,
    enum: Object.values(LikeableType),
  },
  createdAt: { type: Date, default: Date.now },
});

// Create a compound index to ensure a user can only like a specific item once
LikeSchema.index(
  { userId: 1, likeableId: 1, likeableType: 1 },
  { unique: true }
);

// Create or get the Like model
let Like: Model<ILike>;

try {
  // Try to get the existing model
  Like = mongoose.model<ILike>("Like");
} catch {
  // If the model doesn't exist, create it
  Like = mongoose.model<ILike>("Like", LikeSchema);
}

export { Like };
