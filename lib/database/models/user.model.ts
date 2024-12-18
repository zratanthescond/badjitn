import { Schema, model, models, Document } from "mongoose";
export interface IUser extends Document {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  honeNumber: string;
  createdAt: Date;
  password: string;
  emailTocken: string;
  isActive: boolean;
  new: boolean;
}
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
  phoneNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String },
  emailTocken: { type: String },
  isActive: { type: Boolean, default: false },
  new: { type: Boolean, default: true },
});

const User = models.User || model("User", UserSchema);

export default User;
