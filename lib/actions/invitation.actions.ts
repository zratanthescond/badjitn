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
  errorMessage?: string;
  sentAt: string | null;
};

function normalizeRecipients(
  recipients: InvitationRecipient[],
  excludeEmails: Set<string>
) {
  const unique = new Map<string, InvitationRecipient>();
  for (const r of recipients) {
    const email = r.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (excludeEmails.has(email)) continue;
    unique.set(email, { ...r, email });
  }
  return Array.from(unique.values());
}

// ====== GET INVITATION TEMPLATE SETTINGS FOR AN EVENT

export async function getInvitationSettings(eventId: string) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId).select(
      "title imageUrl invitationEmail invitedEmails invitationLog invitationQueue"
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

    // The raw log has one entry per *attempt* — a retried email can appear many
    // times. Collapse to the latest attempt per email so counts and the list
    // reflect actual recipients, not attempt history.
    const latestByEmail = new Map<string, any>();
    for (const entry of event.invitationLog || []) {
      const email = entry.email?.toLowerCase();
      if (!email) continue;
      latestByEmail.set(email, entry);
    }

    const invitationLog: InvitationLogEntry[] = Array.from(latestByEmail.values())
      .map((entry: any) => ({
        email: entry.email,
        firstName: entry.firstName || "",
        lastName: entry.lastName || "",
        status: entry.status,
        errorMessage: entry.errorMessage || "",
        sentAt: entry.sentAt ? new Date(entry.sentAt).toISOString() : null,
      }))
      .sort((a, b) => (b.sentAt || "").localeCompare(a.sentAt || ""));

    return {
      success: true,
      data: {
        settings,
        registrationUrl: buildRegistrationUrl(eventId),
        invitedEmails: event.invitedEmails || [],
        invitationLog,
        queueLength: (event.invitationQueue || []).length,
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

// ====== QUEUE INVITATIONS FOR AN EVENT (INDIVIDUAL OR BULK)
//
// Invitations are never sent synchronously from here: for large lists, sending
// them all in one request either exceeds the SMTP provider's hourly quota (OVH
// mutualisé caps at 200 msgs/hour/account — the actual cause of mass "Échoué"
// results) or the request/server-action itself times out long before that.
// Instead we enqueue recipients and a scheduled job (see
// lib/services/invitationQueue.service.ts, driven by /api/cron/process-invitations)
// drains the queue a few at a time, staying under the provider's rate limit.

export async function enqueueEventInvitations({
  eventId,
  recipients,
}: {
  eventId: string;
  recipients: InvitationRecipient[];
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId).select("invitedEmails invitationQueue");
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const alreadyInvited = new Set(
      (event.invitedEmails || []).map((e: string) => e.toLowerCase())
    );
    const alreadyQueued = new Set(
      (event.invitationQueue || []).map((r: any) => r.email.toLowerCase())
    );

    const toQueue = normalizeRecipients(recipients, new Set());
    const newOnes = toQueue.filter(
      (r) => !alreadyInvited.has(r.email) && !alreadyQueued.has(r.email)
    );
    const skipped = toQueue.length - newOnes.length;

    if (newOnes.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        $push: {
          invitationQueue: {
            $each: newOnes.map((r) => ({
              email: r.email,
              firstName: r.firstName || "",
              lastName: r.lastName || "",
            })),
          },
        },
      });
    }

    revalidatePath(`/cockpit`);

    return {
      success: true,
      message: `${newOnes.length} invitation(s) mise(s) en file d'envoi${
        skipped > 0 ? `, ${skipped} ignorée(s) (déjà invitée(s) ou déjà en file)` : ""
      }. L'envoi se fait progressivement pour respecter la limite du fournisseur mail.`,
      data: { queued: newOnes.length, skipped },
    };
  } catch (error) {
    console.error("Error queueing invitations:", error);
    return { success: false, message: (error as Error).message };
  }
}

// ====== RE-QUEUE PREVIOUSLY FAILED INVITATIONS FOR AN EVENT

export async function retryFailedInvitations({ eventId }: { eventId: string }) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId).select(
      "invitedEmails invitationQueue invitationLog"
    );
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const alreadyInvited = new Set(
      (event.invitedEmails || []).map((e: string) => e.toLowerCase())
    );
    const alreadyQueued = new Set(
      (event.invitationQueue || []).map((r: any) => r.email.toLowerCase())
    );

    // Last known status per email, in log order (log is chronological / oldest first).
    const lastStatus = new Map<string, { firstName?: string; lastName?: string }>();
    for (const entry of event.invitationLog || []) {
      const email = entry.email?.toLowerCase();
      if (!email) continue;
      if (entry.status === "failed") {
        lastStatus.set(email, { firstName: entry.firstName, lastName: entry.lastName });
      } else {
        lastStatus.delete(email);
      }
    }

    const toRetry = Array.from(lastStatus.entries())
      .filter(([email]) => !alreadyInvited.has(email) && !alreadyQueued.has(email))
      .map(([email, info]) => ({ email, ...info }));

    if (toRetry.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        $push: { invitationQueue: { $each: toRetry } },
      });
    }

    revalidatePath(`/cockpit`);

    return {
      success: true,
      message: `${toRetry.length} invitation(s) échouée(s) remise(s) en file d'envoi.`,
      data: { queued: toRetry.length },
    };
  } catch (error) {
    console.error("Error retrying failed invitations:", error);
    return { success: false, message: (error as Error).message };
  }
}

// ====== RE-QUEUE ALREADY-SENT INVITATIONS FOR A RESEND
//
// Unlike enqueueEventInvitations/retryFailedInvitations, this deliberately does NOT
// exclude emails already in invitedEmails — it's for re-sending to people who were
// already successfully invited (e.g. a reminder, or "I never got it").

export async function resendInvitations({
  eventId,
  recipients,
}: {
  eventId: string;
  recipients: InvitationRecipient[];
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();

    const event = await Event.findById(eventId).select("invitationQueue");
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    const alreadyQueued = new Set(
      (event.invitationQueue || []).map((r: any) => r.email.toLowerCase())
    );
    const toQueue = normalizeRecipients(recipients, alreadyQueued);

    if (toQueue.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        $push: {
          invitationQueue: {
            $each: toQueue.map((r) => ({
              email: r.email,
              firstName: r.firstName || "",
              lastName: r.lastName || "",
            })),
          },
        },
      });
    }

    revalidatePath(`/cockpit`);

    return {
      success: true,
      message: `${toQueue.length} invitation(s) remise(s) en file pour renvoi.`,
      data: { queued: toQueue.length },
    };
  } catch (error) {
    console.error("Error resending invitations:", error);
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
