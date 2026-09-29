export type CertificateOrientation = "portrait" | "landscape";

// A4 at 72 DPI; print/PDF scale this up to the full sheet.
export const certificateCanvasSize = (orientation: CertificateOrientation = "landscape") =>
  orientation === "landscape" ? { width: 842, height: 595 } : { width: 595, height: 842 };

export type CertificateRenderData = {
  name: string;
  eventTitle: string;
  eventStart?: string | Date | null;
  eventEnd?: string | Date | null;
  typeName: string;
  issueDate?: string | Date | null;
  certificateId: string;
  verifyUrl: string;
  locale?: string;
};

const TITLE_PREFIX = /^(dr|pr|prof|mr|mme|mlle|m|me)\.?\s+/i;

export const stripTitle = (name: string) => name.trim().replace(TITLE_PREFIX, "").trim();

const formatDay = (value: string | Date, locale: string, withMonthYear: boolean) =>
  new Date(value).toLocaleDateString(locale, withMonthYear ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric" });

export const formatEventDates = (start?: string | Date | null, end?: string | Date | null, locale = "fr") => {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  if (!e || s.toDateString() === e.toDateString()) return formatDay(s, locale, true);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${formatDay(s, locale, false)} – ${formatDay(e, locale, true)}`;
  }
  return `${formatDay(s, locale, true)} – ${formatDay(e, locale, true)}`;
};

export const fillCertificatePlaceholders = (text: string, data: CertificateRenderData) => {
  if (!text) return "";
  const locale = data.locale || "fr";
  return text
    .replace(/{name_no_title}/g, stripTitle(data.name || ""))
    .replace(/{name}/g, data.name || "")
    .replace(/{event_title}/g, data.eventTitle || "")
    .replace(/{event_date}/g, formatEventDates(data.eventStart, data.eventEnd, locale))
    .replace(/{certificate_type}/g, data.typeName || "")
    .replace(/{issue_date}/g, data.issueDate ? new Date(data.issueDate).toLocaleDateString(locale) : "")
    .replace(/{verify_url}/g, data.verifyUrl || "")
    .replace(/{qr_code}/g, data.certificateId || "");
};

export const certificateVerifyUrl = (certificateId: string) => {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || "https://badgi.net").replace(/\/$/, "");
  return `${base}/certificates/${certificateId}`;
};
