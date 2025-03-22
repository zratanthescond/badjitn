import { Schema, model, models, Document } from "mongoose";
export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  phoneNumber: string;
  createdAt: Date;
  password: string;
  emailTocken: string;
  isActive: boolean;
  new: boolean;
  publisher: "none" | "pending" | "approved" | "rejected";
  organisationName: string;
  role: "user" | "admin";
  organisationWebsite: string;
  organisationDescription: string;
}
const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
  phoneNumber: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  password: { type: String },
  emailTocken: { type: String },
  isActive: { type: Boolean, default: false },
  new: { type: Boolean, default: true },
  publisher: {
    type: String,
    default: "none",
    enum: ["none", "pending", "approved", "rejected"],
  },
  organisationName: { type: String },
  organisationDescription: { type: String },
  organisationWebsite: { type: String },
  role: { type: String, default: "user" },
});

const User = models.User || model("User", UserSchema);

export default User;
