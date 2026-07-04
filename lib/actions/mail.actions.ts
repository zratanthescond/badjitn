"use server";

import { verifyAdmin } from "./auth.actions";
import { transporter } from "../mail";

export async function testMailService(targetEmail: string) {
  try {
    // 1. Verify caller is admin
    await verifyAdmin();

    const cleanEnvVar = (val?: string) => val?.replace(/^["']|["']$/g, "") || "";

    const results: any = {
      smtpConfig: {
        host: cleanEnvVar(process.env.SMTP_HOST) || "smtp.gmail.com",
        port: parseInt(cleanEnvVar(process.env.SMTP_PORT) || "587"),
        secure: cleanEnvVar(process.env.SMTP_SECURE) === "true",
        user: cleanEnvVar(process.env.SMTP_USER) || "Not Configured",
        from: cleanEnvVar(process.env.SMTP_FROM) || '"badgiTn" <mail@badgi.tn>',
      },
      connectionStatus: "unknown",
      sendStatus: "unknown",
      message: "",
      error: null,
    };

    // 2. Test Connection (verify SMTP configuration)
    try {
      await transporter.verify();
      results.connectionStatus = "success";
    } catch (connError: any) {
      results.connectionStatus = "failed";
      results.error = {
        stage: "connection_verify",
        message: connError.message || String(connError),
        code: connError.code || null,
        command: connError.command || null,
        stack: connError.stack || null,
        response: connError.response || null,
        responseCode: connError.responseCode || null,
      };
      return { success: false, data: results };
    }

    // 3. Attempt to send test mail
    try {
      const info = await transporter.sendMail({
        from: results.smtpConfig.from,
        to: targetEmail,
        subject: "SMTP Production Mail Service Test ✅",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700;">SMTP Test Succeeded 🎉</h1>
            </div>
            <div style="padding: 24px; color: #374151; line-height: 1.6;">
              <p>Hello,</p>
              <p>This is a test email sent from the <strong>badgi.tn</strong> administration console to verify that the production mailing service is functioning correctly.</p>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 14px;">
                <strong>SMTP Host:</strong> ${results.smtpConfig.host}<br/>
                <strong>SMTP Port:</strong> ${results.smtpConfig.port}<br/>
                <strong>Secure (SSL/TLS):</strong> ${results.smtpConfig.secure ? 'Yes (SSL/TLS)' : 'No (STARTTLS/Plain)'}<br/>
                <strong>Authenticated User:</strong> ${results.smtpConfig.user}
              </div>
              <p>If you received this email, the connection, authorization, and sending processes are fully operational.</p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
              Sent via the badgi.tn Admin Cockpit
            </div>
          </div>
        `,
      });
      results.sendStatus = "success";
      results.messageId = info.messageId;
      results.response = info.response;
      return { success: true, data: results };
    } catch (sendError: any) {
      results.sendStatus = "failed";
      results.error = {
        stage: "sending_email",
        message: sendError.message || String(sendError),
        code: sendError.code || null,
        command: sendError.command || null,
        stack: sendError.stack || null,
        response: sendError.response || null,
        responseCode: sendError.responseCode || null,
      };
      return { success: false, data: results };
    }
  } catch (authError: any) {
    console.error("Test mail auth error:", authError);
    return { success: false, message: authError.message || "Unauthorized" };
  }
}
