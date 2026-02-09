"use server";

import { connectToDatabase } from "../database";
import BankTransfer from "../database/models/banktransfer.model";
import { handleError } from "../utils";
import { revalidatePath } from "next/cache";

export interface GetBankTransfersParams {
    eventTitle?: string;
    status?: "pending" | "approved" | "rejected" | "all";
    searchString?: string;
    page?: number;
    limit?: number;
}

export interface VerifyBankTransferParams {
    transferId: string;
    action: "approve" | "reject";
    verifiedBy: string;
    rejectionReason?: string;
}

// Get all bank transfers with optional filtering
export async function getBankTransfers({
    eventTitle,
    status = "all",
    searchString = "",
    page = 1,
    limit = 10,
}: GetBankTransfersParams) {
    try {
        await connectToDatabase();

        const query: any = {};

        // Filter by event if provided
        if (eventTitle) {
            query.eventTitle = eventTitle;
        }

        // Filter by status if not "all"
        if (status !== "all") {
            query.status = status;
        }

        // Search by buyer name or transfer ID
        if (searchString) {
            query.$or = [
                { buyerName: { $regex: searchString, $options: "i" } },
                { transferId: { $regex: searchString, $options: "i" } },
            ];
        }

        const skipAmount = (page - 1) * limit;

        const transfers = await BankTransfer.find(query)
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(limit);

        const totalCount = await BankTransfer.countDocuments(query);

        return {
            data: JSON.parse(JSON.stringify(transfers)),
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
        };
    } catch (error) {
        handleError(error);
        return { data: [], totalPages: 0, totalCount: 0 };
    }
}

// Get a single bank transfer by ID
export async function getBankTransferById(transferId: string) {
    try {
        await connectToDatabase();

        const transfer = await BankTransfer.findById(transferId);

        if (!transfer) {
            throw new Error("Bank transfer not found");
        }

        return JSON.parse(JSON.stringify(transfer));
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Get bank transfers by order ID
export async function getBankTransferByOrderId(orderId: string) {
    try {
        await connectToDatabase();

        const transfer = await BankTransfer.findOne({ orderId });

        return transfer ? JSON.parse(JSON.stringify(transfer)) : null;
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Verify (approve or reject) a bank transfer
export async function verifyBankTransfer({
    transferId,
    action,
    verifiedBy,
    rejectionReason,
}: VerifyBankTransferParams) {
    try {
        await connectToDatabase();

        const transfer = await BankTransfer.findById(transferId);

        if (!transfer) {
            return {
                success: false,
                message: "Bank transfer not found",
            };
        }

        if (transfer.status !== "pending") {
            return {
                success: false,
                message: `This transfer has already been ${transfer.status}`,
            };
        }

        // Update the transfer status
        transfer.status = action === "approve" ? "approved" : "rejected";
        transfer.verifiedBy = verifiedBy;
        transfer.verifiedAt = new Date();

        if (action === "reject" && rejectionReason) {
            transfer.rejectionReason = rejectionReason;
        }

        await transfer.save();

        // Revalidate the orders page to reflect changes
        revalidatePath("/orders");

        return {
            success: true,
            message: `Bank transfer ${action === "approve" ? "approved" : "rejected"} successfully`,
            transfer: JSON.parse(JSON.stringify(transfer)),
        };
    } catch (error) {
        handleError(error);
        return {
            success: false,
            message: "An error occurred while verifying the bank transfer",
        };
    }
}

// Get statistics for bank transfers
export async function getBankTransferStats(eventTitle?: string) {
    try {
        await connectToDatabase();

        const query: any = eventTitle ? { eventTitle } : {};

        const [total, pending, approved, rejected] = await Promise.all([
            BankTransfer.countDocuments(query),
            BankTransfer.countDocuments({ ...query, status: "pending" }),
            BankTransfer.countDocuments({ ...query, status: "approved" }),
            BankTransfer.countDocuments({ ...query, status: "rejected" }),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
        };
    } catch (error) {
        handleError(error);
        return {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
        };
    }
}
