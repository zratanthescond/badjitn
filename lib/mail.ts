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

export async function sendEligibilityApprovedEmail({
  to,
  eventTitle,
  amount,
}: {
  to: string;
  eventTitle: string;
  amount: string;
}) {
  await transporter.sendMail({
    from: '"badgiTn" <mail@badgi.tn>',
    to,
    subject: "Votre remise a été validée",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <h2 style="margin:0 0 16px;color:#059669;">Remise validée ✅</h2>
        <p style="margin:0 0 16px;">Bonne nouvelle ! Votre éligibilité à la remise a été confirmée par l'organisateur.</p>
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#f0fdf4;">
          <p style="margin:0 0 8px;"><strong>Événement :</strong> ${eventTitle}</p>
          <p style="margin:0;"><strong>Montant à régler :</strong> ${amount}</p>
        </div>
        <p style="margin:16px 0 0;">Votre inscription est désormais confirmée. Merci et à bientôt.</p>
      </div>
    `,
  });
}

export async function sendEligibilityRejectedEmail({
  to,
  eventTitle,
  remainingAmount,
  fullAmount,
}: {
  to: string;
  eventTitle: string;
  remainingAmount: string;
  fullAmount: string;
}) {
  await transporter.sendMail({
    from: '"badgiTn" <mail@badgi.tn>',
    to,
    subject: "Mise à jour de votre inscription — remise non validée",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <h2 style="margin:0 0 16px;color:#dc2626;">Remise non validée</h2>
        <p style="margin:0 0 16px;">Après vérification, votre éligibilité à la remise n'a pas pu être confirmée pour cet événement.</p>
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#fef2f2;">
          <p style="margin:0 0 8px;"><strong>Événement :</strong> ${eventTitle}</p>
          <p style="margin:0 0 8px;"><strong>Tarif plein :</strong> ${fullAmount}</p>
          <p style="margin:0;"><strong>Reste à payer :</strong> ${remainingAmount}</p>
        </div>
        <p style="margin:16px 0 0;">Merci de régler le montant restant afin de finaliser votre inscription au tarif plein.</p>
      </div>
    `,
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
