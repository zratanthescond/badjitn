"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import Order from "@/lib/database/models/order.model";
import Event from "@/lib/database/models/event.model";
import Report from "@/lib/database/models/report.model";
import { handleError } from "@/lib/utils";
import { CreateUserParams, UpdateUserParams } from "@/types";
import EventWork, { IClientInfo } from "../database/models/work.model";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { sendWorkStatusEmail } from "../mail";
import { verifyAdmin, verifyOrganizerOrAdmin } from "./auth.actions";

export async function useUser() {
  try {
    await connectToDatabase();
    const clerkUser = await currentUser();
   const clerkId = clerkUser?.id;
  // const clerkId="user_3FVsPlKSzqlFAAPj2PfVwdw2Rvu";
//  const clerkId="user_3FVszcx7LLBxT5DaPmHVnWGRxL9"; // Ayoub clirck_Id
    if (!clerkId) return null;
    const user = await User.findOne({ clerkId: clerkId });
    return JSON.parse(JSON.stringify(user)) || null;
  } catch (error) {
    handleError(error);
  }
}
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    console.log(user);
    const userMatchingEmail = await User.findOne({ email: user.email });
    if (userMatchingEmail) {
      return { error: `email ${user.email} already used` };
    }
    const userNameExists = await User.findOne({ username: user.username });
    if (userNameExists) {
      return { error: `email ${user.username} already used` };
    }

    const userMatchingPhoneNumber = await User.findOne({
      phoneNumber: user.phoneNumber,
    });
    if (userMatchingPhoneNumber) {
      /// return { error: `phone number ${user.phoneNumber} already used` };
      console.log(`phone number ${user.phoneNumber} already used`);
    }
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
    return { error: (error as Error).message };
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function updateCurrentUserProfile(
  profile: Pick<
    UpdateUserParams,
    "firstName" | "lastName" | "jobTitle" | "republic" | "city" | "village"
  >
) {
  try {
    await connectToDatabase();
    const clerkUser = await currentUser();
    const clerkId = clerkUser?.id;
    // const clerkId="user_3FVsPlKSzqlFAAPj2PfVwdw2Rvu";
    // const clerkId="user_3FVszcx7LLBxT5DaPmHVnWGRxL9"; // Ayoub clirck_Id

    if (!clerkId) throw new Error("Not authenticated");

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        firstName: profile.firstName?.trim(),
        lastName: profile.lastName?.trim(),
        jobTitle: profile.jobTitle?.trim(),
        republic: profile.republic?.trim(),
        city: profile.city?.trim(),
        village: profile.village?.trim(),
      },
      { new: true }
    );

    if (!updatedUser) throw new Error("User update failed");

    // Best-effort sync with Clerk. Do not block profile save if this fails.
    try {
      const client = await clerkClient();
      if (profile.firstName || profile.lastName) {
        await client.users.updateUser(clerkId, {
          ...(profile.firstName ? { firstName: profile.firstName.trim() } : {}),
          ...(profile.lastName ? { lastName: profile.lastName.trim() } : {}),
        });
      }

      await client.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          jobTitle: profile.jobTitle?.trim() || "",
          republic: profile.republic?.trim() || "",
          city: profile.city?.trim() || "",
          village: profile.village?.trim() || "",
        },
      });
    } catch (clerkSyncError) {
      console.error("Clerk sync failed, local profile saved:", clerkSyncError);
    }

    revalidatePath("/profile");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}
export async function reportEvent(
  eventId: string,
  cause: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);

    if (!event) throw new Error("Event not found");

    const report = new Report({
      userId: userId,
      eventId: eventId,
      cause: cause,
    });
    await report.save();

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    handleError(error);
  }
}

function buildEventPortalUrl(eventId: string) {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return `${serverUrl.replace(/\/$/, "")}/events/${eventId}`;
}

function buildSubmitWorkUrl(eventId: string) {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return `${serverUrl.replace(/\/$/, "")}/events/${eventId}/submit-work`;
}

const WORK_STATUS_LABELS_FR: Record<string, string> = {
  draft: "Brouillon",
  submitted: "En attente d'approbation",
  approved: "Approuve",
  rejected: "Refuse",
};

async function buildWorkSummaryProgressHtml({
  eventId,
  userId,
  maxWorkSubmissions,
}: {
  eventId: string;
  userId: string;
  maxWorkSubmissions?: number;
}) {
  const works = await EventWork.find({ eventId, userId }).sort({ createdAt: -1 });

  const remainingLine = maxWorkSubmissions
    ? (() => {
        const acceptedCount = works.filter((w) => w.summaryStatus !== "rejected").length;
        const remaining = Math.max(0, maxWorkSubmissions - acceptedCount);
        return `<p style="margin:0 0 12px;">Il vous reste <strong>${remaining}</strong> soumission${remaining > 1 ? "s" : ""} de resume sur <strong>${maxWorkSubmissions}</strong> pour cet evenement.</p>`;
      })()
    : "";

  const list = works.length
    ? `<div style="margin:0 0 12px;">
        <p style="margin:0 0 6px;font-weight:600;">Vos resumes pour cet evenement :</p>
        <ul style="margin:0;padding-left:18px;">
          ${works
            .map(
              (w) =>
                `<li>${w.title || "Sans titre"} — ${WORK_STATUS_LABELS_FR[w.summaryStatus] || w.summaryStatus}</li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

  return `${remainingLine}${list}`;
}

async function sendWorkNotificationEmail({
  userEmail,
  subject,
  title,
  intro,
  eventTitle,
  summaryTitle,
  eventId,
  extra,
  ctaLabel,
  ctaUrl,
}: {
  userEmail?: string;
  subject: string;
  title: string;
  intro: string;
  eventTitle: string;
  summaryTitle?: string;
  eventId: string;
  extra?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  if (!userEmail) return;

  try {
    await sendWorkStatusEmail({
      to: userEmail,
      subject,
      title,
      intro,
      eventTitle,
      summaryTitle,
      ctaLabel: ctaLabel || "Ouvrir l'evenement",
      ctaUrl: ctaUrl || buildEventPortalUrl(eventId),
      extra,
    });
  } catch (mailError) {
    console.error("Failed to send work notification email:", mailError);
  }
}

export async function submitWorkSummary({
  workId,
  eventId,
  userId,
  title,
  clientInfo,
  note,
}: {
  workId?: string;
  eventId: string;
  userId: string;
  title: string;
  clientInfo: IClientInfo;
  note: string;
}) {
  try {
    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const normalizedTitle = title?.trim() || "Sans titre";
    const submittedAt = new Date();

    if (workId) {
      const work = await EventWork.findOne({ _id: workId, eventId, userId });
      if (!work) throw new Error("Work not found");

      work.title = normalizedTitle;
      work.clientInfo = clientInfo;
      work.note = note;
      work.summaryStatus = "submitted";
      work.submittedAt = submittedAt;
      work.approvedAt = undefined;
      await work.save();

      const progressHtml = await buildWorkSummaryProgressHtml({
        eventId,
        userId,
        maxWorkSubmissions: event.maxWorkSubmissions,
      });

      await sendWorkNotificationEmail({
        userEmail: user.email,
        subject: "Resume modifie et renvoye",
        title: "Votre resume a ete modifie",
        intro:
          "Nous avons bien recu votre nouvelle version du resume. Elle est maintenant en attente d'approbation par le createur de l'evenement.",
        eventTitle: event.title,
        summaryTitle: normalizedTitle,
        eventId,
        extra: progressHtml,
        ctaLabel: "Consulter mes resumes",
        ctaUrl: buildSubmitWorkUrl(eventId),
      });

      return JSON.parse(JSON.stringify(work));
    } else {
      if (event.maxWorkSubmissions) {
        const acceptedCount = await EventWork.countDocuments({
          eventId,
          userId,
          summaryStatus: { $ne: "rejected" },
        });
        if (acceptedCount >= event.maxWorkSubmissions) {
          throw new Error(
            "Vous avez atteint le nombre maximum de soumissions de resume autorisees pour cet evenement."
          );
        }
      }

      const newWork = await EventWork.create({
        eventId,
        userId,
        title: normalizedTitle,
        clientInfo,
        note,
        summaryStatus: "submitted",
        submittedAt,
        fileUrls: [],
      });

      const progressHtml = await buildWorkSummaryProgressHtml({
        eventId,
        userId,
        maxWorkSubmissions: event.maxWorkSubmissions,
      });

      await sendWorkNotificationEmail({
        userEmail: user.email,
        subject: "Resume soumis",
        title: "Votre resume a ete soumis",
        intro:
          "Nous avons bien recu votre resume. Vous pourrez deposer votre travail une fois l'approbation effectuee par le createur de l'evenement.",
        eventTitle: event.title,
        summaryTitle: newWork.title,
        eventId,
        extra: progressHtml,
        ctaLabel: "Consulter mes resumes",
        ctaUrl: buildSubmitWorkUrl(eventId),
      });

      return JSON.parse(JSON.stringify(newWork));
    }
  } catch (error) {
    handleError(error);
    throw error;
  }
}

async function applyWorkApproval(work: InstanceType<typeof EventWork>) {
  work.summaryStatus = "approved";
  work.approvedAt = new Date();
  await work.save();

  const [event, user] = await Promise.all([
    Event.findById(work.eventId),
    User.findById(work.userId),
  ]);

  await sendWorkNotificationEmail({
    userEmail: user?.email,
    subject: "Resume approuve",
    title: "Votre resume a ete approuve",
    intro:
      "Bonne nouvelle, le createur de l'evenement a approuve votre resume. Vous pouvez maintenant soumettre votre travail avec vos pieces jointes en cliquant sur le lien ci-dessous.",
    eventTitle: event?.title || "Evenement",
    summaryTitle: work.title,
    eventId: String(work.eventId),
    ctaLabel: "Soumettre mon travail",
    ctaUrl: buildSubmitWorkUrl(String(work.eventId)),
  });

  return JSON.parse(JSON.stringify(work));
}

async function applyWorkRejection(
  work: InstanceType<typeof EventWork>,
  reason?: string
) {
  work.summaryStatus = "rejected";
  work.rejectedAt = new Date();
  work.rejectionReason = reason?.trim() || undefined;
  await work.save();

  const [event, user] = await Promise.all([
    Event.findById(work.eventId),
    User.findById(work.userId),
  ]);

  await sendWorkNotificationEmail({
    userEmail: user?.email,
    subject: "Resume refuse",
    title: "Votre resume a ete refuse",
    intro:
      "Apres examen, le createur de l'evenement n'a pas pu valider votre resume.",
    eventTitle: event?.title || "Evenement",
    summaryTitle: work.title,
    eventId: String(work.eventId),
    extra: work.rejectionReason
      ? `Motif : ${work.rejectionReason}`
      : undefined,
  });

  return JSON.parse(JSON.stringify(work));
}

/**
 * Registrations that answered "yes" to "Soumettre un travail" at checkout but
 * never went through the separate work-upload flow have no EventWork document
 * yet — only the title/note captured at checkout, on the Order. Approving or
 * rejecting one of these from the admin table must materialize that EventWork
 * document first so it can carry a real status/history.
 */
async function resolveWorkFromOrder(orderId: string) {
  const order = await Order.findById(orderId).populate({
    path: "buyer",
    model: User,
  });
  if (!order) throw new Error("Order not found");
  if (!order.buyer) throw new Error("Buyer not found for this order");

  const eventId = String(order.event);
  const getInfo = (field: string) =>
    (order.requiredUserInfo || []).find((i: any) => i.field === field)
      ?.value || "";

  let work = await EventWork.findOne({ eventId, userId: order.buyer._id });
  if (!work) {
    work = new EventWork({
      eventId,
      userId: order.buyer._id,
      title: getInfo("workSummaryTitle") || "Sans titre",
      note: getInfo("workSummaryNote") || "",
      summaryStatus: "submitted",
      submittedAt: order.createdAt || new Date(),
      fileUrls: [],
    });
    await work.save();
  }
  return work;
}

export async function approveWork(workId: string) {
  try {
    await connectToDatabase();
    const work = await EventWork.findById(workId);
    if (!work) throw new Error("Work not found");
    await verifyOrganizerOrAdmin(String(work.eventId));
    return await applyWorkApproval(work);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function rejectWork(workId: string, reason?: string) {
  try {
    await connectToDatabase();
    const work = await EventWork.findById(workId);
    if (!work) throw new Error("Work not found");
    await verifyOrganizerOrAdmin(String(work.eventId));
    return await applyWorkRejection(work, reason);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

/** Approve a work summary still only captured on the order (no EventWork yet). */
export async function approveOrderWork(orderId: string) {
  try {
    await connectToDatabase();
    const work = await resolveWorkFromOrder(orderId);
    await verifyOrganizerOrAdmin(String(work.eventId));
    return await applyWorkApproval(work);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

/** Reject a work summary still only captured on the order (no EventWork yet). */
export async function rejectOrderWork(orderId: string, reason?: string) {
  try {
    await connectToDatabase();
    const work = await resolveWorkFromOrder(orderId);
    await verifyOrganizerOrAdmin(String(work.eventId));
    return await applyWorkRejection(work, reason);
  } catch (error) {
    handleError(error);
    throw error;
  }
}

/** Append an abstract document/image URL to a work; available as soon as the work exists (no approval gate). */
export async function appendAbstractFile({
  workId,
  eventId,
  userId,
  fileUrl,
}: {
  workId: string;
  eventId: string;
  userId: string;
  fileUrl: string;
}) {
  try {
    await connectToDatabase();
    const work = await EventWork.findOne({ _id: workId, eventId, userId });
    if (!work) throw new Error("Work not found");
    work.abstractFileUrls = work.abstractFileUrls || [];
    work.abstractFileUrls.push(fileUrl);
    await work.save();
    return JSON.parse(JSON.stringify(work));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

/** Append image URL to work; only allowed when summaryStatus is "approved". */
export async function appendWorkSubmissionImage({
  workId,
  eventId,
  userId,
  fileUrl,
}: {
  workId: string;
  eventId: string;
  userId: string;
  fileUrl: string;
}) {
  try {
    await connectToDatabase();
    const work = await EventWork.findOne({ _id: workId, eventId, userId });
    if (!work) throw new Error("Work not found");
    if (work.summaryStatus && work.summaryStatus !== "approved") {
      throw new Error("Work summary must be approved before uploading submission image");
    }
    work.fileUrls = work.fileUrls || [];
    work.fileUrls.push(fileUrl);
    await work.save();

    const [event, user] = await Promise.all([
      Event.findById(eventId),
      User.findById(userId),
    ]);

    await sendWorkNotificationEmail({
      userEmail: user?.email,
      subject: "Travail soumis",
      title: "Votre travail a ete soumis",
      intro:
        "Nous avons bien recu votre fichier de travail. Vous pouvez revenir a tout moment pour consulter vos fichiers deja envoyes.",
      eventTitle: event?.title || "Evenement",
      summaryTitle: work.title,
      eventId,
      extra: "Le travail reste rattache au resume approuve selectionne.",
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function uploadWork({
  fileUrl,
  eventId,
  userId,
  note,
  title,
  clientInfo,
}: {
  fileUrl: string;
  eventId: string;
  userId: string;
  note?: string;
  title?: string;
  clientInfo?: IClientInfo;
}) {
  try {
    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const work = await EventWork.findOne({ eventId, userId });
    if (work) {
      if (fileUrl && fileUrl.length > 0) {
        work.fileUrls = work.fileUrls || [];
        work.fileUrls.push(fileUrl);
      }
      if (note != null && note.length > 0) work.note = note;
      if (title != null) work.title = title.trim();
      if (clientInfo != null) work.clientInfo = clientInfo;
      await work.save();
    } else {
      const newWork = new EventWork({
        eventId,
        userId,
        fileUrls: fileUrl ? [fileUrl] : [],
        note: note ?? "",
        title: title?.trim(),
        clientInfo,
        summaryStatus: "draft",
      });
      await newWork.save();
    }
  } catch (error) {
    handleError(error);
  }
}

export async function getUserWorkByEvent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  try {
    await connectToDatabase();
    const works = await EventWork.find({ eventId, userId }).sort({
      approvedAt: -1,
      submittedAt: -1,
      createdAt: -1,
    });
    return JSON.parse(JSON.stringify(works));
  } catch (error) {
    handleError(error);
  }
}
/** Best-effort display name for a registration, falling back to its free-form custom fields. */
function getOrderParticipantName(order: any) {
  const info: any[] = order.requiredUserInfo || [];
  const findByKeys = (fieldKeys: string[], labelKeys: string[]) =>
    info.find((i: any) => {
      const field = String(i?.field || "").toLowerCase();
      const label = String(i?.label || "").toLowerCase();
      return fieldKeys.includes(field) || labelKeys.includes(label);
    })?.value || "";

  const firstName =
    order.buyer?.firstName ||
    findByKeys(
      ["firstname", "first_name", "prenom", "prénom"],
      ["first name", "firstname", "prenom", "prénom"]
    );
  const lastName =
    order.buyer?.lastName ||
    findByKeys(
      ["lastname", "last_name", "nom", "familyname", "family_name"],
      ["last name", "lastname", "nom", "family name"]
    );

  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  const email = findByKeys(["email"], ["email", "e-mail", "courriel"]);
  return email || "Participant";
}

export async function getUserWorkByEventId({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();
    const eventObjectId = new ObjectId(eventId);
    if (!eventId) throw new Error("Event ID is required");
    const works = await EventWork.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          userId: 1,
          buyer: {
            $concat: [
              { $ifNull: ["$buyer.firstName", ""] },
              " ",
              { $ifNull: ["$buyer.lastName", ""] },
            ],
          },
          title: 1,
          clientInfo: 1,
          fileUrls: 1,
          note: 1,
          summaryStatus: 1,
          submittedAt: 1,
          approvedAt: 1,
          rejectedAt: 1,
          rejectionReason: 1,
          status: "$summaryStatus",
        },
      },
      {
        $match: {
          eventId: eventObjectId,
        },
      },
    ]);

    // Registrations that answered "yes" to "Soumettre un travail" at checkout
    // but never went through the separate work-upload flow (so no EventWork
    // document exists yet) — surface them here too, otherwise they never
    // show up in this admin view even though the intent was captured.
    const existingWorkUserIds = new Set(
      works
        .map((w: any) => w.userId && String(w.userId))
        .filter(Boolean)
    );

    const event = await Event.findById(eventObjectId).select("title");
    const ordersWithWorkIntent = await Order.find({
      event: eventObjectId,
      requiredUserInfo: {
        $elemMatch: { field: "wantsToSubmitWork", value: "yes" },
      },
    }).populate({ path: "buyer", model: User, select: "firstName lastName" });

    const pendingWorks = ordersWithWorkIntent
      .filter(
        (order: any) =>
          !order.buyer || !existingWorkUserIds.has(String(order.buyer._id))
      )
      .map((order: any) => {
        const getInfo = (field: string) =>
          (order.requiredUserInfo || []).find((i: any) => i.field === field)
            ?.value || "";

        return {
          _id: String(order._id),
          createdAt: order.createdAt,
          eventTitle: event?.title || "",
          eventId,
          buyer: getOrderParticipantName(order),
          title: getInfo("workSummaryTitle") || "Sans titre",
          note: getInfo("workSummaryNote") || "",
          clientInfo: undefined,
          fileUrls: [],
          summaryStatus: "draft",
          submittedAt: undefined,
          approvedAt: undefined,
          status: "pending",
          isPendingRegistration: true,
        };
      });

    const combined = [...works, ...pendingWorks];
    const filtered = searchString
      ? combined.filter((w: any) => new RegExp(searchString, "i").test(w.buyer))
      : combined;

    return JSON.parse(JSON.stringify(filtered));
  } catch (error) {
    handleError(error);
  }
}
export async function admingetUsers() {
  try {
    await verifyAdmin();
    await connectToDatabase();
    const users = await User.find({});
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
  }
}
export async function banUser(userId: string) {
  try {
    await verifyAdmin();
    await connectToDatabase();

    const user = await User.findById(userId);
    user.isBanned = true;
    await user.save();
    revalidatePath("/cockpit");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}
export async function unbanUser(userId: string) {
  try {
    await verifyAdmin();
    await connectToDatabase();
    const user = await User.findById(userId);
    user.isBanned = false;
    await user.save();
    revalidatePath("/cockpit");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function admingetReports() {
  try {
    await verifyAdmin();
    await connectToDatabase();
    const reports = await Report.find({})
      .populate({
        path: "userId",
        model: User,
        select: "_id firstName lastName",
      })
      .populate({
        path: "eventId",
        model: Event,
        select: "_id title ",
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });
    return JSON.parse(JSON.stringify(reports));
  } catch (error) {
    handleError(error);
  }
}
export async function adminDiscardReport(reportId: string) {
  try {
    await verifyAdmin();
    await connectToDatabase();
    const report = await Report.findByIdAndUpdate(reportId, {
      status: "reviewed",
    });
    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    handleError(error);
  }
}

// ==========================================
// SEARCH USERS (for autocomplete)
// ==========================================
export async function searchUsers(query: string) {
  try {
    if (!query || query.trim().length < 2) return [];
    await connectToDatabase();

    const regex = new RegExp(query.trim(), "i");
    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { username: regex },
      ],
    })
      .select("_id firstName lastName email username photo")
      .limit(10)
      .lean();

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
    return [];
  }
}
