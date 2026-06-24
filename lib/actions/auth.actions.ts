import { useUser } from "./user.actions";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";

// Verify the caller is an authenticated administrator
export async function verifyAdmin() {
  const user = await useUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }
  return user;
}

// Verify the caller is either an admin or the organizer of a specific event
export async function verifyOrganizerOrAdmin(eventId: string) {
  const user = await useUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }
  if (user.role === "admin") {
    return user;
  }

  await connectToDatabase();
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  
  const isOrganizer = event.organizer?.toString() === user._id.toString();
  if (!isOrganizer) {
    throw new Error("Forbidden: You are not authorized to manage this event.");
  }
  return user;
}

// Verify the caller is authenticated
export async function verifyUser() {
  const user = await useUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in.");
  }
  return user;
}
