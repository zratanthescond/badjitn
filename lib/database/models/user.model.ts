import { Schema, model, models, Document } from "mongoose";

export const USER_ROLES = ["user", "admin", "sup_organ"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  republic?: string;
  city?: string;
  village?: string;
  photo: string;
  phoneNumber: string;
  createdAt: Date;
  password: string;
  emailTocken: string;
  isActive: boolean;
  new: boolean;
  role: UserRole;
  isBanned: boolean;
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
  jobTitle: { type: String },
  republic: { type: String },
  city: { type: String },
  village: { type: String },
  photo: { type: String },
  phoneNumber: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  password: { type: String },
  emailTocken: { type: String },
  isActive: { type: Boolean, default: false },
  new: { type: Boolean, default: true },
  role: { type: String, enum: USER_ROLES, default: "user" },
  isBanned: { type: Boolean, default: false },
});

const User = models.User || model("User", UserSchema);

export default User;
