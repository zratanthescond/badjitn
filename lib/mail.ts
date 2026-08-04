import nodemailer from "nodemailer";
import { buildInvitationEmailHtml, InvitationEmailData } from "./invitationTemplate";

const cleanEnvVar = (val?: string) => val?.replace(/^["']|["']$/g, "") || "";

export const transporter = nodemailer.createTransport({
  host: cleanEnvVar(process.env.SMTP_HOST) || "smtp.gmail.com",
  port: parseInt(cleanEnvVar(process.env.SMTP_PORT) || "587"),
  secure: cleanEnvVar(process.env.SMTP_SECURE) === "true", // true for 465, false for other ports
  auth: {
    user: cleanEnvVar(process.env.SMTP_USER),
    pass: cleanEnvVar(process.env.SMTP_PASS),
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `http://localhost:3000/api/auth/activate/${token}`; // Nowy format URL
  await transporter.sendMail({
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
    to: email,
    subject: "Verify Your Email",
    html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
  });
}

export async function sendRegistrationConfirmationEmail({
  to,
  eventTitle,
  details,
  totalAmount,
  statusLabel,
  statusColor,
}: {
  to: string;
  eventTitle: string;
  details: { name: string; option?: string; price: string }[];
  totalAmount: string;
  statusLabel: string;
  statusColor: string;
}) {
  const rows =
    details.length > 0
      ? details
          .map(
            (d) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
            ${d.name}${d.option ? `<br/><span style="color:#6b7280;font-size:12px;">${d.option}</span>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${d.price}</td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="2" style="padding:8px 12px;color:#6b7280;">Inscription</td></tr>`;

  await transporter.sendMail({
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
    to,
    subject: `Confirmation de votre inscription — ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <h2 style="margin:0 0 8px;">Inscription enregistrée</h2>
        <p style="margin:0 0 16px;color:#374151;">Merci pour votre inscription à <strong>${eventTitle}</strong>. Voici le récapitulatif :</p>

        <div style="margin:0 0 16px;">
          <span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${statusColor}1a;color:${statusColor};font-weight:600;font-size:14px;">
            Statut : ${statusLabel}
          </span>
        </div>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:13px;color:#374151;">Détails</th>
              <th style="padding:8px 12px;text-align:right;font-size:13px;color:#374151;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td style="padding:10px 12px;font-weight:700;">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700;">${totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">
          Vous recevrez une mise à jour par email si le statut de votre inscription évolue.
        </p>
      </div>
    `,
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
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
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
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
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

export async function sendBankTransferApprovedEmail({
  to,
  buyerName,
  eventTitle,
  amount,
}: {
  to: string;
  buyerName: string;
  eventTitle: string;
  amount: string;
}) {
  await transporter.sendMail({
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
    to,
    subject: `Virement confirmé — ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <div style="background:#059669;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Virement bancaire confirmé ✅</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;background:#ffffff;">
          <p style="margin:0 0 16px;">Bonjour <strong>${buyerName}</strong>,</p>
          <p style="margin:0 0 16px;">Nous avons bien reçu et validé votre virement bancaire. Votre inscription est maintenant confirmée.</p>
          <div style="border:1px solid #d1fae5;border-radius:10px;padding:16px;background:#f0fdf4;margin:0 0 16px;">
            <p style="margin:0 0 8px;"><strong>Événement :</strong> ${eventTitle}</p>
            <p style="margin:0 0 8px;"><strong>Montant réglé :</strong> ${amount}</p>
            <p style="margin:0;"><strong>Statut :</strong> <span style="color:#059669;font-weight:600;">Approuvé</span></p>
          </div>
          <p style="margin:0 0 16px;color:#374151;">Votre place est réservée. Vous pouvez consulter votre ticket depuis votre espace Badgi.net.</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Merci de votre confiance et à bientôt lors de l'événement !</p>
        </div>
      </div>
    `,
  });
}

export async function sendBankTransferRejectedEmail({
  to,
  buyerName,
  eventTitle,
  amount,
  rejectionReason,
}: {
  to: string;
  buyerName: string;
  eventTitle: string;
  amount: string;
  rejectionReason?: string;
}) {
  const reasonBlock = rejectionReason
    ? `<p style="margin:8px 0 0;"><strong>Motif :</strong> ${rejectionReason}</p>`
    : "";

  await transporter.sendMail({
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
    to,
    subject: `Virement non validé — ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
        <div style="background:#dc2626;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">Virement bancaire non validé ❌</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;background:#ffffff;">
          <p style="margin:0 0 16px;">Bonjour <strong>${buyerName}</strong>,</p>
          <p style="margin:0 0 16px;">Après vérification, nous n'avons pas pu valider votre virement bancaire pour l'événement suivant :</p>
          <div style="border:1px solid #fecaca;border-radius:10px;padding:16px;background:#fef2f2;margin:0 0 16px;">
            <p style="margin:0 0 8px;"><strong>Événement :</strong> ${eventTitle}</p>
            <p style="margin:0 0 8px;"><strong>Montant :</strong> ${amount}</p>
            <p style="margin:0;"><strong>Statut :</strong> <span style="color:#dc2626;font-weight:600;">Refusé</span></p>
            ${reasonBlock}
          </div>
          <p style="margin:0 0 16px;color:#374151;">Si vous pensez qu'il s'agit d'une erreur ou souhaitez soumettre un nouveau virement, veuillez contacter notre équipe ou vous connecter à votre espace Badgi.net.</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Nous nous excusons pour la gêne occasionnée.</p>
        </div>
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
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
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

export async function sendInvitationEmail({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: InvitationEmailData;
}) {
  await transporter.sendMail({
    from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
    to,
    subject,
    html: buildInvitationEmailHtml(template),
  });
}
