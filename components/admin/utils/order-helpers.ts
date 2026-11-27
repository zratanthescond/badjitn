/**
 * Shared, pure helpers for deriving display values from an Order document.
 * Extracted from order-administration.tsx so the admin page header (KPI
 * counts), the table, the export payload and the mobile cards all agree on
 * the same participant name / payment status — instead of each re-deriving
 * it slightly differently.
 */

export type PaymentStatusTone = "green" | "amber" | "red" | "blue" | "neutral";

export interface PaymentStatusInfo {
  key: string;
  tone: PaymentStatusTone;
  labelKey: string;
  fallback: string;
}

/**
 * Resolves the participant's display name for an order, falling back
 * through the derived `buyer` string, then structured firstName/lastName
 * (or fullName) fields in `requiredUserInfo`, then any two non-empty
 * values, and finally a "Guest registration" placeholder.
 */
export function getParticipantNameFromOrder(
  order: any,
  guestFallback = "Guest registration"
): string {
  const buyerText = String(order?.buyer || "").trim();
  if (buyerText && buyerText.toLowerCase() !== "guest registration") {
    return buyerText;
  }

  const infoList = Array.isArray(order?.requiredUserInfo) ? order.requiredUserInfo : [];

  const normalize = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const findValue = (matcher: (field: string, label: string) => boolean) => {
    const found = infoList.find((info: any) => matcher(normalize(info?.field), normalize(info?.label)));
    return String(found?.value || "").trim();
  };

  const firstName = findValue(
    (field, label) =>
      ["firstname", "first_name", "prenom"].includes(field) || ["firstname", "prenom"].includes(label)
  );
  const lastName = findValue(
    (field, label) =>
      ["lastname", "last_name", "nom", "familyname", "family_name"].includes(field) ||
      ["lastname", "nom", "familyname"].includes(label)
  );
  const fullName = findValue(
    (field, label) =>
      ["name", "fullname", "full_name", "nomcomplet", "nom_complet"].includes(field) ||
      ["name", "fullname", "nomcomplet"].includes(label)
  );

  const formatName = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  const combined = `${firstName} ${lastName}`.trim();
  if (combined) return formatName(combined);
  if (fullName) return formatName(fullName);

  const fallbackValues = infoList.map((info: any) => String(info?.value || "").trim()).filter(Boolean);
  const fallbackCombined = `${fallbackValues[0] || ""} ${fallbackValues[1] || ""}`.trim();
  if (fallbackCombined) return formatName(fallbackCombined);

  return buyerText ? formatName(buyerText) : guestFallback;
}

/** The ticket-type key actually shown: forced to "free" whenever the amount is 0. */
export function getTicketTypeKey(order: any): string {
  const amount = Number(order?.totalAmount);
  if (amount === 0) return "free";
  return order?.type || "paid";
}

/**
 * A finer-grained "what does the organizer need to do" status than the raw
 * ticket type: surfaces pending eligibility review and pending bank
 * transfers as actionable (amber), distinguishes "paid" from "hosted" /
 * "doorpay", and falls back to "free".
 */
export function getPaymentStatus(order: any): PaymentStatusInfo {
  if (order?.eligibilityStatus === "pending") {
    return { key: "pending-eligibility", tone: "amber", labelKey: "paymentStatus.pendingEligibility", fallback: "En attente de validation" };
  }
  if (order?.eligibilityStatus === "rejected") {
    return { key: "rejected-eligibility", tone: "red", labelKey: "paymentStatus.rejectedEligibility", fallback: "Remise refusée" };
  }
  if (order?.type === "bank_transfer") {
    return { key: "pending-transfer", tone: "amber", labelKey: "paymentStatus.pendingTransfer", fallback: "Virement à vérifier" };
  }
  if (order?.type === "doorpay") {
    return { key: "doorpay", tone: "neutral", labelKey: "paymentStatus.doorpay", fallback: "Paiement sur place" };
  }
  if (order?.type === "hosted") {
    return { key: "hosted", tone: "blue", labelKey: "paymentStatus.hosted", fallback: "Pris en charge" };
  }
  if (Number(order?.totalAmount) === 0) {
    return { key: "free", tone: "neutral", labelKey: "paymentStatus.free", fallback: "Gratuit" };
  }
  return { key: "paid", tone: "green", labelKey: "paymentStatus.paid", fallback: "Payé" };
}

export const ORDER_CATEGORY_KEYS = ["attendee", "speaker", "sponsor", "staff"] as const;
export type OrderCategory = (typeof ORDER_CATEGORY_KEYS)[number];

export function getOrderCategory(order: any): OrderCategory {
  const category = String(order?.category || "attendee");
  return (ORDER_CATEGORY_KEYS as readonly string[]).includes(category)
    ? (category as OrderCategory)
    : "attendee";
}

const TONE_CHIP_CLASSES: Record<PaymentStatusTone, string> = {
  green: "bg-admin-success-soft text-admin-success",
  amber: "bg-admin-warning-soft text-admin-warning",
  red: "bg-admin-critical-soft text-destructive",
  blue: "bg-admin-accent-soft text-admin-accent-soft-foreground",
  neutral: "bg-muted text-muted-foreground",
};

export function toneChipClass(tone: PaymentStatusTone): string {
  return TONE_CHIP_CLASSES[tone];
}
