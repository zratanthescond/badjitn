import { useUser } from "./user.actions";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import Organisation from "../database/models/organisation.model";

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
  
  const userId = user._id.toString();
  const isOrganizer = event.organizer?.toString() === userId;

  // Members of the event's organisation (creator or added members) have the same access
  let hasOrgAccess = false;
  if (!isOrganizer && event.organisation) {
    const org = await Organisation.findById(event.organisation).select("creator admins");
    if (org) {
      hasOrgAccess =
        org.creator?.toString() === userId ||
        (org.admins ?? []).some((id: any) => id.toString() === userId);
    }
  }

  if (!isOrganizer && !hasOrgAccess) {
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
