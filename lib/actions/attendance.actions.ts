"use server";

import { connectToDatabase } from "@/lib/database";
import Attendance from "@/lib/database/models/attendance.model";
import Order from "@/lib/database/models/order.model";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type RecordAttendanceParams = {
  orderId: string;
  eventId: string;
  scanPoint: string;
  userId: string;
  path: string;
};

export async function recordAttendance({
  orderId,
  eventId,
  scanPoint,
  userId,
  path,
}: RecordAttendanceParams) {
  try {
    await connectToDatabase();

    // Verify order exists and belongs to the event
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Ticket not found");
    if (order.event.toString() !== eventId) {
      throw new Error("Ticket does not belong to this event");
    }

    const newAttendance = await Attendance.create({
      order: orderId,
      event: eventId,
      scanPoint,
      scannedBy: userId,
      scannedAt: new Date(),
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newAttendance));
  } catch (error) {
    handleError(error);
  }
}

export async function getAttendanceByEvent(eventId: string) {
  try {
    await connectToDatabase();

    const attendances = await Attendance.find({ event: eventId })
      .populate({
        path: "order",
        model: Order,
        populate: {
          path: "buyer",
          select: "firstName lastName",
        },
      })
      .sort({ scannedAt: "desc" });

    return JSON.parse(JSON.stringify(attendances));
  } catch (error) {
    handleError(error);
  }
}
