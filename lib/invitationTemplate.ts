export interface InvitationEmailData {
  headerImageUrl?: string;
  bodyHtml?: string;
  buttonLabel?: string;
  buttonUrl: string;
  footerText?: string;
  footerPhone?: string;
  footerEmail?: string;
}

const DEFAULT_BODY_HTML = `
  <p>Chère Consœur, Cher Confrère,</p>
  <p>Nous avons le plaisir de vous inviter à participer à notre prochain événement.</p>
  <p>Les inscriptions sont désormais ouvertes.</p>
`;

export function buildInvitationEmailHtml(data: InvitationEmailData): string {
  const buttonLabel = data.buttonLabel?.trim() || "S'inscrire";
  const bodyHtml = data.bodyHtml?.trim() || DEFAULT_BODY_HTML;

  const headerBlock = data.headerImageUrl
    ? `<img src="${data.headerImageUrl}" alt="" width="640" style="display:block;width:100%;max-width:640px;height:auto;border-radius:16px 16px 0 0;" />`
    : "";

  const footerLine = data.footerText
    ? `<p style="margin:0 0 4px;">${data.footerText}</p>`
    : "";
  const phoneLine = data.footerPhone
    ? `<p style="margin:0 0 4px;">Tél : ${data.footerPhone}</p>`
    : "";
  const emailLine = data.footerEmail
    ? `<p style="margin:0;">E-mail : ${data.footerEmail}</p>`
    : "";

  const footerBlock =
    footerLine || phoneLine || emailLine
      ? `
    <div style="text-align:center;padding:24px 16px 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#374151;">
      <p style="margin:0 0 6px;color:#dc2626;font-weight:700;font-size:14px;">Contactez-nous</p>
      ${footerLine}
      ${phoneLine}
      ${emailLine}
    </div>`
      : "";

  return `
<div style="max-width:640px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#eaf3fb;">
  ${headerBlock}
  <div style="background:#ffffff;border-radius:${headerBlock ? "0" : "16px"} 0 16px 16px;padding:32px 28px;text-align:center;color:#1e3a5f;">
    <div style="font-size:15px;line-height:1.7;text-align:center;">
      ${bodyHtml}
    </div>
    <div style="margin:28px 0 8px;">
      <a href="${data.buttonUrl}" style="display:inline-block;background:#173b6c;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
        ${buttonLabel}
      </a>
    </div>
  </div>
  ${footerBlock}
</div>`;
}
