import { Schema, model, models, Document } from "mongoose";

export interface IBankTransfer extends Document {
    orderId: string;
    transferId: string | null;
    screenshotUrl: string | null;
    status: "pending" | "approved" | "rejected";
    verifiedBy: string | null;
    verifiedAt: Date | null;
    rejectionReason: string | null;
    amount: number;
    buyerName: string;
    eventTitle: string;
    createdAt: Date;
    updatedAt: Date;
}

const BankTransferSchema = new Schema<IBankTransfer>(
    {
        orderId: {
            type: String,
            required: true,
            index: true,
        },
        transferId: {
            type: String,
            default: null,
        },
        screenshotUrl: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            required: true,
            index: true,
        },
        verifiedBy: {
            type: String,
            default: null,
        },
        verifiedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            required: true,
        },
        buyerName: {
            type: String,
            required: true,
        },
        eventTitle: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
BankTransferSchema.index({ orderId: 1, status: 1 });
BankTransferSchema.index({ createdAt: -1 });

const BankTransfer =
    models.BankTransfer ||
    model<IBankTransfer>("BankTransfer", BankTransferSchema);

export default BankTransfer;
