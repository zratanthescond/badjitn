import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFieldResponse {
    fieldId: string;
    label: string;
    value: string | string[];
}

export interface IFormSubmission extends Document {
    form: mongoose.Types.ObjectId;
    event?: mongoose.Types.ObjectId;
    email: string;
    name: string;
    responses: IFieldResponse[];
    submittedAt: Date;
}

const FieldResponseSchema = new Schema<IFieldResponse>({
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
});

const FormSubmissionSchema = new Schema<IFormSubmission>(
    {
        form: { type: Schema.Types.ObjectId, ref: "EventForm", required: true },
        event: { type: Schema.Types.ObjectId, ref: "Event" },
        email: { type: String, required: true },
        name: { type: String, required: true },
        responses: { type: [FieldResponseSchema], default: [] },
        submittedAt: { type: Date, default: Date.now },
    },
);

// Prevent duplicate submissions from the same email for the same form
FormSubmissionSchema.index({ form: 1, email: 1 }, { unique: true });

// Force re-register on schema changes (needed for HMR / dev server)
if (mongoose.models.FormSubmission) {
    delete mongoose.models.FormSubmission;
}

const FormSubmission: Model<IFormSubmission> = mongoose.model<IFormSubmission>("FormSubmission", FormSubmissionSchema);

export default FormSubmission;
