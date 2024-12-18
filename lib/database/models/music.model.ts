import { Document, Schema, model, models } from "mongoose";

export interface IMusic extends Document {
  _id: string;
  title: string;
  artist: string;
  album: string;
  path: string;
  image: string;
  createdAt: Date;
  wave: string;
  addedBy: { _id: string; firstName: string; lastName: string };
}

const MusicSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: String },
  album: { type: String, required: true },
  path: { type: String, required: true },
  image: { type: String, required: true },
  wave: { type: String },
  createAt: { type: Date, default: Date.now() },
  addedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const Music = models.Music || model("Music", MusicSchema);

export default Music;
