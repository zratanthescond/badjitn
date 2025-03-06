import mongoose, { Schema, Document, model, models } from "mongoose";

// Define the interface for the UserSponsor document
interface IUserSponsor extends Document {
  name: string;
  tier: "gold" | "platinum" | "silver" | "bronze";
  logo: string;
  website: string;
  creator: mongoose.Types.ObjectId; // Reference to the User document
  createdAt: Date;
  updatedAt: Date;
}

// Define the UserSponsor schema
const UserSponsorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ["gold", "platinum", "silver", "bronze"],
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the UserSponsor model
const UserSponsor =
  models.UserSponsor || model<IUserSponsor>("UserSponsor", UserSponsorSchema);

export default UserSponsor;
