"use server"

import { revalidatePath } from "next/cache"
import { connectToDatabase } from "@/lib/database"
import BadgeDesign from "@/lib/database/models/badge-design.model"
import Order from "@/lib/database/models/order.model"
import { handleError } from "@/lib/utils"
import { ObjectId } from "mongodb"

// BADGE DESIGN ACTIONS
export async function createBadgeDesign(params: any) {
    try {
        await connectToDatabase()
        const newDesign = await BadgeDesign.create(params)
        return JSON.parse(JSON.stringify(newDesign))
    } catch (error) {
        handleError(error)
    }
}

export async function getBadgeDesignByEvent(eventId: string) {
    try {
        await connectToDatabase()
        const design = await BadgeDesign.findOne({ eventId: new ObjectId(eventId) })
        return design ? JSON.parse(JSON.stringify(design)) : null
    } catch (error) {
        handleError(error)
    }
}

export async function updateBadgeDesign(id: string, params: any) {
    try {
        await connectToDatabase()
        const updatedDesign = await BadgeDesign.findByIdAndUpdate(id, params, { new: true })
        return JSON.parse(JSON.stringify(updatedDesign))
    } catch (error) {
        handleError(error)
    }
}

// ATTENDEE ACTIONS
export async function getAttendeesByEvent(eventId: string) {
    try {
        await connectToDatabase()

        // Fetch all orders for this event and populate the buyer (User)
        const orders = await Order.find({ event: new ObjectId(eventId) }).populate("buyer")

        // Map orders to a friendly "Attendee" structure for the frontend
        const attendees = orders.map((order: any) => {
            const buyer = order.buyer
            return {
                _id: order._id.toString(),
                name: buyer ? `${buyer.firstName} ${buyer.lastName}` : "Unknown Guest",
                email: buyer?.email || "",
                photo: buyer?.photo || "",
                // Try to find company/title from requiredUserInfo if not directly on User
                company: order.requiredUserInfo?.find((f: any) => f.label?.toLowerCase().includes("company") || f.field?.toLowerCase().includes("company"))?.value || "",
                title: order.requiredUserInfo?.find((f: any) => f.label?.toLowerCase().includes("title") || f.label?.toLowerCase().includes("poste") || f.field?.toLowerCase().includes("title"))?.value || "",
                category: order.category || "attendee",
                badgePrinted: order.badgePrinted || false,
                orderId: order._id.toString(),
            }
        })

        return JSON.parse(JSON.stringify(attendees))
    } catch (error) {
        handleError(error)
    }
}

export async function updateAttendee(id: string, params: any) {
    try {
        await connectToDatabase()
        // We update the Order record which now contains category and badgePrinted
        const updatedOrder = await Order.findByIdAndUpdate(id, params, { new: true }) as any
        if (updatedOrder && updatedOrder.event) {
            revalidatePath(`/events/${updatedOrder.event}/badge`)
        }
        return JSON.parse(JSON.stringify(updatedOrder))
    } catch (error) {
        handleError(error)
    }
}

export async function deleteAttendee(id: string) {
    try {
        await connectToDatabase()
        // Deleting the "attendee" means deleting the Order registration
        const deletedOrder = await Order.findByIdAndDelete(id) as any
        if (deletedOrder && deletedOrder.event) {
            revalidatePath(`/events/${deletedOrder.event}/badge`)
        }
        return { success: true }
    } catch (error) {
        handleError(error)
    }
}
