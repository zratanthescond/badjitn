"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import EventForm, { IFormField } from "../database/models/eventform.model";
import FormSubmission from "../database/models/formsubmission.model";
import { randomUUID } from "crypto";
import { transporter } from "../mail";

// ====== TYPES

interface CreateEventFormParams {
    title: string;
    description?: string;
    coverImage?: string;
    posterImage?: string;
    eventId?: string;
    organisationId: string;
    creatorId: string;
    fields: Omit<IFormField, "_id">[];
}

interface UpdateEventFormParams {
    formId: string;
    title?: string;
    description?: string;
    coverImage?: string;
    posterImage?: string;
    fields?: Omit<IFormField, "_id">[];
    isActive?: boolean;
}

interface SubmitFormParams {
    formId: string;
    email: string;
    name: string;
    responses: {
        fieldId: string;
        label: string;
        value: string | string[];
    }[];
}

interface SendInvitationsParams {
    formId: string;
    emails: string[];
}

// ====== CREATE EVENT FORM

export async function createEventForm(params: CreateEventFormParams) {
    try {
        await connectToDatabase();

        const slug = randomUUID().replace(/-/g, "").slice(0, 12);

        const form = await EventForm.create({
            title: params.title,
            description: params.description || "",
            coverImage: params.coverImage || "",
            posterImage: params.posterImage || "",
            event: params.eventId || undefined,
            organisation: params.organisationId || undefined,
            creator: params.creatorId,
            fields: params.fields.map((f, i) => ({ ...f, order: i })),
            slug,
            isActive: true,
        });

        revalidatePath("/profile");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(form)),
        };
    } catch (error) {
        console.error("Error creating event form:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== GET EVENT FORM BY SLUG (public)

export async function getEventFormBySlug(slug: string) {
    try {
        await connectToDatabase();

        const form = await EventForm.findOne({ slug, isActive: true })
            .populate({ path: "event", select: "title imageUrl startDateTime endDateTime location" })
            .populate({ path: "creator", model: "User", select: "firstName lastName photo" })
            .populate({ path: "organisation", model: "Organisation", select: "name logo slug" });

        if (!form) {
            return { success: false, message: "Form not found" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(form)),
        };
    } catch (error) {
        console.error("Error fetching form by slug:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== GET EVENT FORM(S) BY EVENT ID

export async function getEventFormsByEventId(eventId: string) {
    try {
        await connectToDatabase();

        const forms = await EventForm.find({ event: eventId })
            .populate({ path: "event", select: "title imageUrl" })
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: JSON.parse(JSON.stringify(forms)),
        };
    } catch (error) {
        console.error("Error fetching forms by event:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== GET FORMS BY CREATOR

export async function getFormsByCreator(creatorId: string) {
    try {
        await connectToDatabase();

        const forms = await EventForm.find({ creator: creatorId })
            .populate({ path: "event", select: "title imageUrl startDateTime" })
            .populate({ path: "organisation", model: "Organisation", select: "name logo slug" })
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: JSON.parse(JSON.stringify(forms)),
        };
    } catch (error) {
        console.error("Error fetching forms by creator:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== UPDATE EVENT FORM

export async function updateEventForm(params: UpdateEventFormParams) {
    try {
        await connectToDatabase();

        const updateData: any = {};
        if (params.title !== undefined) updateData.title = params.title;
        if (params.description !== undefined) updateData.description = params.description;
        if (params.coverImage !== undefined) updateData.coverImage = params.coverImage;
        if (params.posterImage !== undefined) updateData.posterImage = params.posterImage;
        if (params.fields !== undefined)
            updateData.fields = params.fields.map((f, i) => ({ ...f, order: i }));
        if (params.isActive !== undefined) updateData.isActive = params.isActive;

        const form = await EventForm.findByIdAndUpdate(params.formId, updateData, { new: true });

        if (!form) {
            return { success: false, message: "Form not found" };
        }

        revalidatePath("/profile");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(form)),
        };
    } catch (error) {
        console.error("Error updating form:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== DELETE EVENT FORM

export async function deleteEventForm(formId: string) {
    try {
        await connectToDatabase();

        await EventForm.findByIdAndDelete(formId);
        await FormSubmission.deleteMany({ form: formId });

        revalidatePath("/profile");

        return { success: true, message: "Form deleted successfully" };
    } catch (error) {
        console.error("Error deleting form:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== SUBMIT FORM (public, for attendees)

export async function submitEventForm(params: SubmitFormParams) {
    try {
        await connectToDatabase();

        // Check if form exists and is active
        const form = await EventForm.findById(params.formId);
        if (!form) {
            return { success: false, message: "Form not found" };
        }
        if (!form.isActive) {
            return { success: false, message: "This form is no longer accepting responses" };
        }

        // Check for duplicate submission
        const existing = await FormSubmission.findOne({
            form: params.formId,
            email: params.email.toLowerCase(),
        });
        if (existing) {
            return { success: false, message: "You have already submitted this form" };
        }

        const submission = await FormSubmission.create({
            form: params.formId,
            event: form.event || undefined,
            email: params.email.toLowerCase(),
            name: params.name,
            responses: params.responses,
        });

        return {
            success: true,
            data: JSON.parse(JSON.stringify(submission)),
        };
    } catch (error) {
        console.error("Error submitting form:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== GET SUBMISSIONS FOR A FORM

export async function getFormSubmissions(formId: string) {
    try {
        await connectToDatabase();

        const submissions = await FormSubmission.find({ form: formId })
            .sort({ submittedAt: -1 });

        return {
            success: true,
            data: JSON.parse(JSON.stringify(submissions)),
        };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== BADGE MANAGEMENT: SUBMISSIONS AS "ATTENDEES"
//
// Mirrors lib/actions/badge.actions.ts's getAttendeesByEvent/deleteAttendee,
// but reads from FormSubmission (custom-form registrants) instead of Order
// (regular event registrants) so the same badge designer/printer UI can be
// reused unchanged for both flows.

export async function getFormAttendees(formId: string) {
    try {
        await connectToDatabase();

        const submissions = await FormSubmission.find({ form: formId }).sort({ submittedAt: -1 });

        const getResponseVal = (responses: any[], fields: string[]) => {
            const found = responses.find(
                (r) =>
                    fields.some((f) => r.label?.toLowerCase().includes(f)) ||
                    fields.some((f) => r.fieldId?.toLowerCase().includes(f))
            );
            return found ? (Array.isArray(found.value) ? found.value.join(", ") : found.value) : "";
        };

        const attendees = submissions.map((submission: any) => ({
            _id: submission._id.toString(),
            name: submission.name,
            email: submission.email,
            photo: "",
            company: getResponseVal(submission.responses || [], ["company", "société", "societe", "organisation"]),
            title: getResponseVal(submission.responses || [], ["title", "poste", "fonction", "job"]),
            category: submission.category || "attendee",
            badgePrinted: submission.badgePrinted || false,
            orderId: submission._id.toString(),
        }));

        return JSON.parse(JSON.stringify(attendees));
    } catch (error) {
        console.error("Error fetching form attendees:", error);
        return [];
    }
}

export async function updateFormAttendee(id: string, params: any) {
    try {
        await connectToDatabase();
        const updated = await FormSubmission.findByIdAndUpdate(id, params, { new: true });
        revalidatePath("/profile");
        return updated ? JSON.parse(JSON.stringify(updated)) : null;
    } catch (error) {
        console.error("Error updating form attendee:", error);
        return null;
    }
}

export async function deleteFormAttendee(id: string) {
    try {
        await connectToDatabase();
        await FormSubmission.findByIdAndDelete(id);
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Error deleting form attendee:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== PDF-STYLE REPORT DATA FOR A FORM

export async function getFormReportData(formId: string) {
    try {
        await connectToDatabase();

        const form = await EventForm.findById(formId)
            .populate({ path: "organisation", model: "Organisation", select: "name logo" });
        if (!form) {
            return { success: false, message: "Form not found" };
        }

        const submissions = await FormSubmission.find({ form: formId }).sort({ submittedAt: 1 });

        // Daily submission trend (last 14 days that actually have data, chronological)
        const byDay = new Map<string, number>();
        for (const s of submissions) {
            const day = new Date(s.submittedAt).toISOString().slice(0, 10);
            byDay.set(day, (byDay.get(day) || 0) + 1);
        }
        const submissionTrend = Array.from(byDay.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-14)
            .map(([date, count]) => ({ date, count }));

        // Per-field breakdown for choice-based fields (select/radio/checkbox)
        const choiceFields = (form.fields || []).filter((f: any) =>
            ["select", "radio", "checkbox"].includes(f.type)
        );
        const fieldBreakdowns = choiceFields.map((field: any) => {
            const counts: Record<string, number> = {};
            for (const option of field.options || []) counts[option] = 0;
            for (const s of submissions) {
                const response = (s.responses || []).find((r: any) => r.label === field.label);
                if (!response) continue;
                const values = Array.isArray(response.value) ? response.value : [response.value];
                for (const v of values) {
                    if (v == null || v === "") continue;
                    counts[v] = (counts[v] || 0) + 1;
                }
            }
            return { label: field.label, counts };
        });

        const participantsList = submissions
            .slice()
            .reverse()
            .map((s: any) => ({
                name: s.name,
                email: s.email,
                submittedAt: s.submittedAt,
                responses: (s.responses || []).map((r: any) => ({
                    label: r.label,
                    value: Array.isArray(r.value) ? r.value.join(", ") : r.value,
                })),
            }));

        return {
            success: true,
            data: {
                form: JSON.parse(JSON.stringify(form)),
                stats: {
                    totalSubmissions: submissions.length,
                    invitedCount: (form.invitedEmails || []).length,
                    submissionTrend,
                    fieldBreakdowns,
                    participantsList,
                },
            },
        };
    } catch (error) {
        console.error("Error building form report:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== SEND INVITATIONS VIA EMAIL

export async function sendFormInvitations(params: SendInvitationsParams) {
    try {
        await connectToDatabase();

        const form = await EventForm.findById(params.formId);

        if (!form) {
            return { success: false, message: "Form not found" };
        }

        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        const formUrl = `${baseUrl}/forms/${form.slug}`;
        const formTitle = form.title || "Custom Event";

        // Add emails to invitedEmails list (merge, avoid duplicates)
        const existingEmails = new Set(form.invitedEmails.map((e: string) => e.toLowerCase()));
        const newEmails = params.emails
            .map((e) => e.toLowerCase().trim())
            .filter((e) => e && !existingEmails.has(e));

        if (newEmails.length > 0) {
            form.invitedEmails = [...form.invitedEmails, ...newEmails];
            await form.save();
        }

        // Send emails
        const allEmails = [...newEmails];
        const results = { sent: 0, failed: 0 };

        for (const email of allEmails) {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM?.replace(/^["']|["']$/g, "") || '"badgiTn" <mail@badgi.tn>',
                    to: email,
                    subject: `You're invited to register for: ${formTitle}`,
                    html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">You're Invited! 🎉</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">${formTitle}</p>
              </div>
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                  Hello,<br><br>
                  You have been invited to register for <strong>${formTitle}</strong>. 
                  Please fill out the registration form by clicking the button below.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${formUrl}" 
                     style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Register Now
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
                  Or copy this link: <a href="${formUrl}" style="color: #6366f1;">${formUrl}</a>
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Sent via <strong>badgi.tn</strong> — Event Management Platform
                </p>
              </div>
            </div>
          `,
                });
                results.sent++;
            } catch (err) {
                console.error(`Failed to send to ${email}:`, err);
                results.failed++;
            }
        }

        revalidatePath("/profile");

        return {
            success: true,
            message: `Invitations sent: ${results.sent} successful, ${results.failed} failed`,
            data: results,
        };
    } catch (error) {
        console.error("Error sending invitations:", error);
        return { success: false, message: (error as Error).message };
    }
}

// ====== GET FORM BY ID

export async function getEventFormById(formId: string) {
    try {
        await connectToDatabase();

        const form = await EventForm.findById(formId)
            .populate({ path: "event", select: "title imageUrl startDateTime endDateTime location" })
            .populate({ path: "creator", model: "User", select: "firstName lastName photo" });

        if (!form) {
            return { success: false, message: "Form not found" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(form)),
        };
    } catch (error) {
        console.error("Error fetching form:", error);
        return { success: false, message: (error as Error).message };
    }
}
