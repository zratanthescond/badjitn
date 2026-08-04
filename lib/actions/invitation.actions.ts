"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import { sendInvitationEmail } from "@/lib/mail";
import { verifyOrganizerOrAdmin } from "./auth.actions";

function buildRegistrationUrl(eventId: string) {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return `${serverUrl.replace(/\/$/, "")}/events/${eventId}`;
}

export type InvitationEmailSettings = {
  subject?: string;
  headerImageUrl?: string;
  bodyHtml?: string;
  buttonLabel?: string;
  footerText?: string;
  footerPhone?: string;
  footerEmail?: string;
};

export type InvitationRecipient = {
  email: string;
  firstName?: string;
  lastName?: string;
};

export type InvitationLogEntry = {
  email: string;
  firstName?: string;
  lastName?: string;
  status: "sent" | "failed";
  sentAt: string | null;
};

// ====== GET INVITATION TEMPLATE SETTINGS FOR AN EVENT

export async function getInvitationSettings(eventId: string) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId).select(
      "title imageUrl invitationEmail invitedEmails invitationLog"
    );
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const settings: InvitationEmailSettings = {
      subject: event.invitationEmail?.subject || `Invitation — ${event.title}`,
      headerImageUrl: event.invitationEmail?.headerImageUrl || event.imageUrl,
      bodyHtml: event.invitationEmail?.bodyHtml || "",
      buttonLabel: event.invitationEmail?.buttonLabel || "S'inscrire",
      footerText: event.invitationEmail?.footerText || "",
      footerPhone: event.invitationEmail?.footerPhone || "",
      footerEmail: event.invitationEmail?.footerEmail || "",
    };

    const invitationLog: InvitationLogEntry[] = (event.invitationLog || [])
      .map((entry: any) => ({
        email: entry.email,
        firstName: entry.firstName || "",
        lastName: entry.lastName || "",
        status: entry.status,
        sentAt: entry.sentAt ? new Date(entry.sentAt).toISOString() : null,
      }))
      .reverse();

    return {
      success: true,
      data: {
        settings,
        registrationUrl: buildRegistrationUrl(eventId),
        invitedEmails: event.invitedEmails || [],
        invitationLog,
      },
    };
  } catch (error) {
    console.error("Error fetching invitation settings:", error);
    return { success: false, message: (error as Error).message };
  }
}

// ====== SAVE INVITATION TEMPLATE SETTINGS FOR AN EVENT

export async function saveInvitationSettings(
  eventId: string,
  settings: InvitationEmailSettings
) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findByIdAndUpdate(
      eventId,
      { invitationEmail: settings },
      { new: true }
    );
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    revalidatePath(`/cockpit`);
    return { success: true, message: "Modèle d'invitation enregistré" };
  } catch (error) {
    console.error("Error saving invitation settings:", error);
    return { success: false, message: (error as Error).message };
  }
}

// ====== SEND INVITATIONS FOR AN EVENT (INDIVIDUAL OR BULK)

export async function sendEventInvitations({
  eventId,
  recipients,
}: {
  eventId: string;
  recipients: InvitationRecipient[];
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const registrationUrl = buildRegistrationUrl(eventId);
    const subject = event.invitationEmail?.subject || `Invitation — ${event.title}`;
    const template = {
      headerImageUrl: event.invitationEmail?.headerImageUrl || event.imageUrl,
      bodyHtml: event.invitationEmail?.bodyHtml,
      buttonLabel: event.invitationEmail?.buttonLabel,
      buttonUrl: registrationUrl,
      footerText: event.invitationEmail?.footerText,
      footerPhone: event.invitationEmail?.footerPhone,
      footerEmail: event.invitationEmail?.footerEmail,
    };

    const previouslyInvited = new Set(
      (event.invitedEmails || []).map((e: string) => e.toLowerCase())
    );

    const uniqueRecipients = new Map<string, InvitationRecipient>();
    for (const r of recipients) {
      const email = r.email?.trim().toLowerCase();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        uniqueRecipients.set(email, { ...r, email });
      }
    }

    const results: { email: string; status: "sent" | "failed"; alreadyInvited: boolean }[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of Array.from(uniqueRecipients.values())) {
      const alreadyInvited = previouslyInvited.has(recipient.email);
      try {
        await sendInvitationEmail({ to: recipient.email, subject, template });
        results.push({ email: recipient.email, status: "sent", alreadyInvited });
        sent++;
      } catch (err) {
        console.error(`Failed to send invitation to ${recipient.email}:`, err);
        results.push({ email: recipient.email, status: "failed", alreadyInvited });
        failed++;
      }
    }

    const logEntries = results.map((r) => {
      const recipient = uniqueRecipients.get(r.email);
      return {
        email: r.email,
        firstName: recipient?.firstName || "",
        lastName: recipient?.lastName || "",
        status: r.status,
      };
    });

    const newlySent = results.filter((r) => r.status === "sent").map((r) => r.email);
    if (newlySent.length > 0) {
      const merged = new Set([...(event.invitedEmails || []), ...newlySent]);
      event.invitedEmails = Array.from(merged);
    }
    if (logEntries.length > 0) {
      event.invitationLog = [...(event.invitationLog || []), ...logEntries];
    }
    if (newlySent.length > 0 || logEntries.length > 0) {
      await event.save();
    }

    revalidatePath(`/cockpit`);

    return {
      success: true,
      message: `Invitations envoyées : ${sent} réussies, ${failed} échouées`,
      data: { sent, failed, results },
    };
  } catch (error) {
    console.error("Error sending invitations:", error);
    return { success: false, message: (error as Error).message };
  }
}

// ====== SEND A SINGLE TEST INVITATION (DOES NOT AFFECT invitedEmails)

export async function sendTestInvitationEmail({
  eventId,
  testEmail,
}: {
  eventId: string;
  testEmail: string;
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId);
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const registrationUrl = buildRegistrationUrl(eventId);
    const subject = `[Test] ${event.invitationEmail?.subject || `Invitation — ${event.title}`}`;
    const template = {
      headerImageUrl: event.invitationEmail?.headerImageUrl || event.imageUrl,
      bodyHtml: event.invitationEmail?.bodyHtml,
      buttonLabel: event.invitationEmail?.buttonLabel,
      buttonUrl: registrationUrl,
      footerText: event.invitationEmail?.footerText,
      footerPhone: event.invitationEmail?.footerPhone,
      footerEmail: event.invitationEmail?.footerEmail,
    };

    await sendInvitationEmail({ to: testEmail, subject, template });

    return { success: true, message: `Email de test envoyé à ${testEmail}` };
  } catch (error) {
    console.error("Error sending test invitation:", error);
    return { success: false, message: (error as Error).message };
  }
}
