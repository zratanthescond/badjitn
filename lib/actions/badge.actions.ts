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
            const buyer = order.buyer;

            let attendeeName = "Unknown Guest";
            let attendeeEmail = buyer?.email || "";

            if (buyer && buyer.firstName && buyer.firstName.toLowerCase() !== "guest") {
                attendeeName = `${buyer.firstName} ${buyer.lastName || ""}`.trim();
            } else if (order.requiredUserInfo && Array.isArray(order.requiredUserInfo)) {
                const getVal = (fields: string[]) => {
                    const found = order.requiredUserInfo.find((f: any) => 
                        fields.includes(f.field?.toLowerCase()) || fields.includes(f.label?.toLowerCase())
                    );
                    return found ? found.value : "";
                };
                
                const firstName = getVal(["firstname", "first_name", "prenom"]);
                const lastName = getVal(["lastname", "last_name", "nom", "familyname", "family_name"]);
                const fullName = getVal(["name", "fullname", "full_name", "nomcomplet", "nom_complet"]);
                
                if (fullName) attendeeName = fullName;
                else if (firstName || lastName) attendeeName = `${firstName} ${lastName}`.trim();

                if (!attendeeEmail) {
                    attendeeEmail = getVal(["email", "e-mail", "courriel"]);
                }
            }

            const formatName = (str: string) => {
                if (!str) return "";
                return str
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('-');
            };

            attendeeName = formatName(attendeeName);

            return {
                _id: order._id.toString(),
                name: attendeeName,
                email: attendeeEmail,
                photo: buyer?.photo || "",
                // Try to find company/title from requiredUserInfo if not directly on User
                company: order.requiredUserInfo?.find((f: any) => f.label?.toLowerCase().includes("company") || f.field?.toLowerCase().includes("company") || f.label?.toLowerCase().includes("société") || f.label?.toLowerCase().includes("societe"))?.value || "",
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
