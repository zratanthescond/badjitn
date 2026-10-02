"use server";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/database";
import Certificate from "@/lib/database/models/certification.model";
import CertificateTemplate from "@/lib/database/models/certificate-template.model";
import Event from "@/lib/database/models/event.model";
import Order from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model";
import { verifyOrganizerOrAdmin } from "./auth.actions";
import { useUser } from "./user.actions";
import { getAttendeesByEvent } from "./badge.actions";

const toPlain = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Unknown error");
const normalizeEmail = (email?: string) => (email || "").trim().toLowerCase();

// ---------- Templates (certificate types) ----------

export async function getCertificateTemplates(eventId: string) {
  await verifyOrganizerOrAdmin(eventId);
  await connectToDatabase();
  const templates = await CertificateTemplate.find({ eventId: new ObjectId(eventId) }).sort({ createdAt: 1 });
  const counts = await Certificate.aggregate([
    { $match: { eventId: new ObjectId(eventId), source: "issued" } },
    { $group: { _id: "$templateId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c: any) => [String(c._id), c.count]));
  return toPlain(templates).map((t: any) => ({ ...t, issuedCount: countMap.get(String(t._id)) || 0 }));
}

export type SaveCertificateTemplateParams = {
  eventId: string;
  templateId?: string;
  name: string;
  description?: string;
  elements: any[];
  backgroundImage?: string;
  orientation: "portrait" | "landscape";
};

export async function saveCertificateTemplate(params: SaveCertificateTemplateParams) {
  try {
    await verifyOrganizerOrAdmin(params.eventId);
    await connectToDatabase();
    const name = params.name.trim();
    if (!name) return { error: "NAME_REQUIRED" };

    const fields = {
      name,
      description: params.description?.trim() || "",
      elements: params.elements,
      backgroundImage: params.backgroundImage || "",
      orientation: params.orientation,
    };

    if (params.templateId) {
      const updated = await CertificateTemplate.findOneAndUpdate(
        { _id: new ObjectId(params.templateId), eventId: new ObjectId(params.eventId) },
        { $set: fields },
        { new: true }
      );
      if (!updated) return { error: "NOT_FOUND" };
      return { template: toPlain(updated) };
    }

    // The first type of an event becomes the default so approved requests get a design.
    const hasTemplates = await CertificateTemplate.exists({ eventId: new ObjectId(params.eventId) });
    const created = await CertificateTemplate.create({
      ...fields,
      eventId: new ObjectId(params.eventId),
      isDefault: !hasTemplates,
    });
    return { template: toPlain(created) };
  } catch (error) {
    console.error("saveCertificateTemplate", error);
    return { error: errorMessage(error) };
  }
}

export async function setDefaultCertificateTemplate(templateId: string) {
  try {
    await connectToDatabase();
    const template = await CertificateTemplate.findById(templateId);
    if (!template) return { error: "NOT_FOUND" };
    await verifyOrganizerOrAdmin(String(template.eventId));
    await CertificateTemplate.updateMany({ eventId: template.eventId }, { $set: { isDefault: false } });
    template.isDefault = true;
    await template.save();
    return { success: true };
  } catch (error) {
    console.error("setDefaultCertificateTemplate", error);
    return { error: errorMessage(error) };
  }
}

export async function deleteCertificateTemplate(templateId: string) {
  try {
    await connectToDatabase();
    const template = await CertificateTemplate.findById(templateId);
    if (!template) return { error: "NOT_FOUND" };
    await verifyOrganizerOrAdmin(String(template.eventId));
    // Recipients may already hold links to these certificates; never orphan them.
    const issued = await Certificate.countDocuments({ templateId: template._id });
    if (issued > 0) return { error: "HAS_CERTIFICATES", count: issued };
    await template.deleteOne();
    if (template.isDefault) {
      const next = await CertificateTemplate.findOne({ eventId: template.eventId }).sort({ createdAt: 1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    return { success: true };
  } catch (error) {
    console.error("deleteCertificateTemplate", error);
    return { error: errorMessage(error) };
  }
}

// ---------- Issued certificates ----------

export type CertificatePlanChoice = { plan: string; option: string };

// Plans (and the chosen option / sub-plan, e.g. a workshop) bought on each order,
// so certificates can be filtered by what the participant registered for.
async function loadOrderPlans(filter: Record<string, unknown>) {
  const orders = await Order.find(filter, { details: 1 }).lean();
  const plansByOrder = new Map<string, CertificatePlanChoice[]>();
  for (const order of orders as any[]) {
    const plans: CertificatePlanChoice[] = [];
    for (const detail of order.details || []) {
      const plan = String(detail?.name || "").trim();
      if (!plan) continue;
      // Legacy orders may hold the option as an object instead of its name.
      const rawOption = detail?.option && typeof detail.option === "object" ? detail.option.name : detail?.option;
      plans.push({ plan, option: String(rawOption || "").trim() });
    }
    plansByOrder.set(String(order._id), plans);
  }
  return plansByOrder;
}

export async function getCertificateCandidates(eventId: string) {
  await verifyOrganizerOrAdmin(eventId);
  const attendees = (await getAttendeesByEvent(eventId)) || [];
  const plansByOrder = await loadOrderPlans({ event: new ObjectId(eventId) });
  return attendees.map((a: any) => ({
    orderId: a.orderId || a._id,
    name: a.name,
    email: a.email || "",
    category: a.category,
    plans: plansByOrder.get(String(a.orderId || a._id)) || [],
  }));
}

export async function getIssuedCertificates(eventId: string) {
  await verifyOrganizerOrAdmin(eventId);
  await connectToDatabase();
  const certificates = await Certificate.find({ eventId: new ObjectId(eventId), source: "issued" })
    .sort({ createdAt: -1 })
    .lean();
  const orderIds = certificates.map((c: any) => c.orderId).filter(Boolean);
  const plansByOrder = orderIds.length
    ? await loadOrderPlans({ _id: { $in: orderIds }, event: new ObjectId(eventId) })
    : new Map<string, CertificatePlanChoice[]>();
  return toPlain(certificates).map((c: any) => ({
    _id: c._id,
    templateId: c.templateId,
    orderId: c.orderId || null,
    plans: (c.orderId && plansByOrder.get(String(c.orderId))) || [],
    recipientName: c.recipientName || "",
    recipientEmail: c.recipientEmail || "",
    emailStatus: c.emailStatus || "none",
    emailSentAt: c.emailSentAt || null,
    emailError: c.emailError || "",
    hasAccount: !!c.userId,
    createdAt: c.createdAt,
  }));
}

export type IssueRecipient = { orderId?: string; name: string; email?: string };

export async function issueCertificates({
  eventId,
  templateId,
  recipients,
}: {
  eventId: string;
  templateId: string;
  recipients: IssueRecipient[];
}) {
  try {
    await verifyOrganizerOrAdmin(eventId);
    await connectToDatabase();
    const eventObjectId = new ObjectId(eventId);
    const template = await CertificateTemplate.findOne({ _id: new ObjectId(templateId), eventId: eventObjectId });
    if (!template) return { error: "NOT_FOUND" };

    const existing = await Certificate.find(
      { eventId: eventObjectId, templateId: template._id, source: "issued" },
      { orderId: 1, recipientName: 1, recipientEmail: 1 }
    ).lean();
    const existingOrders = new Set(existing.filter((c: any) => c.orderId).map((c: any) => String(c.orderId)));
    const existingManual = new Set(
      existing.map((c: any) => `${(c.recipientName || "").trim().toLowerCase()}|${c.recipientEmail || ""}`)
    );

    const emails = Array.from(new Set(recipients.map((r) => normalizeEmail(r.email)).filter(Boolean)));
    const users = emails.length ? await User.find({ email: { $in: emails } }, { _id: 1, email: 1 }).lean() : [];
    const userByEmail = new Map(users.map((u: any) => [normalizeEmail(u.email), u._id]));

    const now = new Date();
    const docs: any[] = [];
    let skipped = 0;
    for (const recipient of recipients) {
      const name = (recipient.name || "").trim();
      if (!name) {
        skipped++;
        continue;
      }
      const email = normalizeEmail(recipient.email);
      const manualKey = `${name.toLowerCase()}|${email}`;
      if ((recipient.orderId && existingOrders.has(recipient.orderId)) || existingManual.has(manualKey)) {
        skipped++;
        continue;
      }
      if (recipient.orderId) existingOrders.add(recipient.orderId);
      existingManual.add(manualKey);
      docs.push({
        eventId: eventObjectId,
        templateId: template._id,
        source: "issued",
        status: "approved",
        approvedAt: now,
        orderId: recipient.orderId ? new ObjectId(recipient.orderId) : undefined,
        recipientName: name,
        recipientEmail: email || undefined,
        userId: email ? userByEmail.get(email) : undefined,
        emailStatus: "none",
      });
    }

    if (docs.length) await Certificate.insertMany(docs);
    return { created: docs.length, skipped };
  } catch (error) {
    console.error("issueCertificates", error);
    return { error: errorMessage(error) };
  }
}

async function loadIssuedForEvent(ids: string[]) {
  await connectToDatabase();
  const certificates = await Certificate.find({ _id: { $in: ids.map((id) => new ObjectId(id)) }, source: "issued" });
  const eventIds = Array.from(new Set(certificates.map((c: any) => String(c.eventId))));
  // Every certificate touched in one call must belong to an event the caller manages.
  for (const eventId of eventIds) await verifyOrganizerOrAdmin(eventId);
  return certificates;
}

export async function updateIssuedCertificate(id: string, { recipientName, recipientEmail }: { recipientName: string; recipientEmail?: string }) {
  try {
    const [certificate] = await loadIssuedForEvent([id]);
    if (!certificate) return { error: "NOT_FOUND" };
    const name = recipientName.trim();
    if (!name) return { error: "NAME_REQUIRED" };
    const email = normalizeEmail(recipientEmail);
    certificate.recipientName = name;
    certificate.recipientEmail = email || undefined;
    if (email) {
      const user = await User.findOne({ email }, { _id: 1 });
      certificate.userId = user?._id;
    } else {
      certificate.userId = undefined;
    }
    await certificate.save();
    return { success: true };
  } catch (error) {
    console.error("updateIssuedCertificate", error);
    return { error: errorMessage(error) };
  }
}

export async function deleteIssuedCertificates(ids: string[]) {
  try {
    const certificates = await loadIssuedForEvent(ids);
    const { deletedCount } = await Certificate.deleteMany({ _id: { $in: certificates.map((c: any) => c._id) } });
    return { deleted: deletedCount };
  } catch (error) {
    console.error("deleteIssuedCertificates", error);
    return { error: errorMessage(error) };
  }
}

export async function queueCertificateEmails(ids: string[]) {
  try {
    const certificates = await loadIssuedForEvent(ids);
    const withEmail = certificates.filter((c: any) => !!c.recipientEmail);
    await Certificate.updateMany(
      { _id: { $in: withEmail.map((c: any) => c._id) } },
      { $set: { emailStatus: "queued", emailQueuedAt: new Date() }, $unset: { emailError: "" } }
    );
    return { queued: withEmail.length, missingEmail: certificates.length - withEmail.length };
  } catch (error) {
    console.error("queueCertificateEmails", error);
    return { error: errorMessage(error) };
  }
}

// ---------- Viewing (public + profile) ----------

async function resolveCertificateView(certificate: any) {
  const event = await Event.findById(certificate.eventId, {
    title: 1,
    startDateTime: 1,
    endDateTime: 1,
    location: 1,
  }).lean();

  let template: any = null;
  if (certificate.templateId) template = await CertificateTemplate.findById(certificate.templateId).lean();
  if (!template) template = await CertificateTemplate.findOne({ eventId: certificate.eventId, isDefault: true }).lean();

  let recipientName = certificate.recipientName || "";
  if (!recipientName && certificate.userId) {
    const user: any = await User.findById(certificate.userId, { firstName: 1, lastName: 1 }).lean();
    if (user) recipientName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  return toPlain({
    certificate: {
      _id: certificate._id,
      recipientName,
      issuedAt: certificate.approvedAt || certificate.createdAt,
      source: certificate.source || "request",
    },
    template,
    event: event
      ? {
          _id: (event as any)._id,
          title: (event as any).title,
          startDateTime: (event as any).startDateTime,
          endDateTime: (event as any).endDateTime,
          locationName: (event as any).location?.name || "",
        }
      : null,
  });
}

// Public by design: the certificate id is the verification token printed in the QR code.
export async function getCertificateForView(certificateId: string) {
  if (!ObjectId.isValid(certificateId)) return null;
  await connectToDatabase();
  const certificate = await Certificate.findById(certificateId).lean();
  if (!certificate || (certificate as any).status !== "approved") return null;
  return resolveCertificateView(certificate);
}

export async function getMyCertificates() {
  const user = await useUser();
  if (!user) return [];
  await connectToDatabase();
  const email = normalizeEmail(user.email);
  const certificates = await Certificate.find({
    status: "approved",
    $or: [{ userId: new ObjectId(user._id) }, ...(email ? [{ recipientEmail: email }] : [])],
  })
    .sort({ createdAt: -1 })
    .lean();

  const templateIds = certificates.map((c: any) => c.templateId).filter(Boolean);
  const eventIds = certificates.map((c: any) => c.eventId);
  const [templates, defaults, events] = await Promise.all([
    CertificateTemplate.find({ _id: { $in: templateIds } }, { name: 1 }).lean(),
    CertificateTemplate.find({ eventId: { $in: eventIds }, isDefault: true }, { name: 1, eventId: 1 }).lean(),
    Event.find({ _id: { $in: eventIds } }, { title: 1, startDateTime: 1, imageUrl: 1 }).lean(),
  ]);
  const templateName = new Map(templates.map((t: any) => [String(t._id), t.name]));
  const defaultName = new Map(defaults.map((t: any) => [String(t.eventId), t.name]));
  const eventMap = new Map(events.map((e: any) => [String(e._id), e]));

  return toPlain(
    certificates.map((c: any) => {
      const event: any = eventMap.get(String(c.eventId));
      return {
        _id: c._id,
        typeName: (c.templateId && templateName.get(String(c.templateId))) || defaultName.get(String(c.eventId)) || "",
        eventTitle: event?.title || "",
        eventStart: event?.startDateTime || null,
        eventImage: event?.imageUrl || "",
        issuedAt: c.approvedAt || c.createdAt,
      };
    })
  );
}
