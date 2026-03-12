import mongoose, { Schema, Document, Model } from "mongoose";

// Sub-schema for individual form fields
export interface IFormField {
    _id?: string;
    type: "text" | "number" | "email" | "select" | "radio" | "checkbox" | "textarea" | "date" | "phone";
    label: string;
    placeholder?: string;
    options?: string[];
    required: boolean;
    order: number;
}

export interface IEventForm extends Document {
    title: string;
    description?: string;
    coverImage?: string;
    event?: mongoose.Types.ObjectId;
    organisation?: mongoose.Types.ObjectId;
    creator: mongoose.Types.ObjectId;
    fields: IFormField[];
    invitedEmails: string[];
    isActive: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
    type: {
        type: String,
        required: true,
        enum: ["text", "number", "email", "select", "radio", "checkbox", "textarea", "date", "phone"],
    },
    label: { type: String, required: true },
    placeholder: { type: String, default: "" },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
});

const EventFormSchema = new Schema<IEventForm>(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        coverImage: { type: String, default: "" },
        event: { type: Schema.Types.ObjectId, ref: "Event" },
        organisation: { type: Schema.Types.ObjectId, ref: "Organisation" },
        creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
        fields: { type: [FormFieldSchema], default: [] },
        invitedEmails: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        slug: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

// Force re-register on schema changes (needed for HMR / dev server)
if (mongoose.models.EventForm) {
    delete mongoose.models.EventForm;
}

const EventForm: Model<IEventForm> = mongoose.model<IEventForm>("EventForm", EventFormSchema);

export default EventForm;
