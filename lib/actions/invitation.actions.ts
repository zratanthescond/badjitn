"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Event from "@/lib/database/models/event.model";
import { sendInvitationEmail } from "@/lib/mail";
import { verifyOrganizerOrAdmin } from "./auth.actions";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const results: { email: string; status: "sent" | "failed" | "skipped" }[] = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    const toSend = Array.from(uniqueRecipients.values());
    for (let i = 0; i < toSend.length; i++) {
      const recipient = toSend[i];

      // Never re-send to an email that was already successfully invited to this event.
      if (previouslyInvited.has(recipient.email)) {
        results.push({ email: recipient.email, status: "skipped" });
        skipped++;
        continue;
      }

      let status: "sent" | "failed";
      try {
        await sendInvitationEmail({ to: recipient.email, subject, template });
        status = "sent";
        previouslyInvited.add(recipient.email);
        sent++;
      } catch (err) {
        console.error(`Failed to send invitation to ${recipient.email}:`, err);
        status = "failed";
        failed++;
      }
      results.push({ email: recipient.email, status });

      // Persist each result immediately (rather than one bulk save at the end) so
      // that a successful send is never lost — and never re-sent on retry — even
      // if this batch gets interrupted (large batches can take a while).
      const update: any = {
        $push: {
          invitationLog: {
            email: recipient.email,
            firstName: recipient.firstName || "",
            lastName: recipient.lastName || "",
            status,
          },
        },
      };
      if (status === "sent") {
        update.$addToSet = { invitedEmails: recipient.email };
      }
      await Event.findByIdAndUpdate(eventId, update);

      // Small pacing delay between real send attempts to avoid SMTP provider
      // rate-limiting/throttling on large batches (seen causing mass failures).
      if (i < toSend.length - 1) {
        await sleep(250);
      }
    }

    revalidatePath(`/cockpit`);

    return {
      success: true,
      message: `Invitations : ${sent} envoyées, ${failed} échouées, ${skipped} ignorées (déjà invitées avec succès)`,
      data: { sent, failed, skipped, results },
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
