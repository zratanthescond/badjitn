import { Schema, model, models, Document } from "mongoose";

export interface IBadgeElement {
    id: string;
    type: "text" | "shape" | "image" | "qr";
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right";
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    rotation?: number;
    imageUrl?: string;
    qrData?: string;
}

export interface IBadgeDesign extends Document {
    eventId: Schema.Types.ObjectId;
    name: string;
    frontElements: IBadgeElement[];
    backElements: IBadgeElement[];
    backgroundImage?: string;
    backBackgroundImage?: string;
    width: number;
    height: number;
    orientation: "portrait" | "landscape";
    createdAt: Date;
    updatedAt: Date;
}

const BadgeElementSchema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ["text", "shape", "image", "qr"] },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    content: { type: String },
    fontSize: { type: Number },
    fontWeight: { type: String },
    textAlign: { type: String, enum: ["left", "center", "right"] },
    color: { type: String },
    backgroundColor: { type: String },
    borderRadius: { type: Number },
    rotation: { type: Number },
    imageUrl: { type: String },
    qrData: { type: String },
});

const BadgeDesignSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    frontElements: [BadgeElementSchema],
    backElements: [BadgeElementSchema],
    backgroundImage: { type: String },
    backBackgroundImage: { type: String },
    width: { type: Number, default: 400 },
    height: { type: Number, default: 566 },
    orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const BadgeDesign = models.BadgeDesign || model("BadgeDesign", BadgeDesignSchema);

export default BadgeDesign;
