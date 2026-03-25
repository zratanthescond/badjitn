import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "honcongs1@gmail.com",
    pass: "eaqa ozzh qtfr qmzl",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `http://localhost:3000/api/auth/activate/${token}`; // Nowy format URL
  await transporter.sendMail({
    from: '"badgiTn" <mail@badgi.tn>',
    to: email,
    subject: "Verify Your Email",
    html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
}

export async function sendWorkStatusEmail({
  to,
  subject,
  title,
  intro,
  eventTitle,
  summaryTitle,
  ctaLabel,
  ctaUrl,
  extra,
}: {
  to: string;
  subject: string;
  title: string;
  intro: string;
  eventTitle: string;
  summaryTitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  extra?: string;
}) {
  const summaryLine = summaryTitle
    ? `<p style="margin:0 0 12px;"><strong>Resume:</strong> ${summaryTitle}</p>`
    : "";
  const extraLine = extra ? `<p style="margin:16px 0 0;">${extra}</p>` : "";
  const cta = ctaLabel && ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;">${ctaLabel}</a></p>`
    : "";

  await transporter.sendMail({
    from: '"badgiTn" <mail@badgi.tn>',
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <h2 style="margin:0 0 16px;">${title}</h2>
        <p style="margin:0 0 16px;">${intro}</p>
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#f9fafb;">
          <p style="margin:0 0 12px;"><strong>Event:</strong> ${eventTitle}</p>
          ${summaryLine}
        </div>
        ${extraLine}
        ${cta}
      </div>
    `,
  });
}
