import sendEmail from "../services/email.service";

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const subject = "Verify your email address";
    const text = `
Welcome!

Please verify your email by clicking the link below:

${verificationUrl}

This link expires in 24 hours.
`;
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <h2 style="font-size: 22px; font-weight: 600;">Verify Your Email</h2>
  <p style="font-size: 15px; color: #555; line-height: 1.6;">
    Thank you for registering. Please verify your email address.
  </p>

  <!-- Bulletproof button (works in Outlook, Gmail, Apple Mail) -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius: 8px; background: #000000;">
        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            background: #000000;
            color: #ffffff;
            font-family: Arial, sans-serif;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            mso-padding-alt: 0;
            text-align: center;
          "
        >
          Verify Email
        </a>
      </td>
    </tr>
  </table>

  <p style="font-size: 13px; color: #999; margin-top: 28px;">
    Or copy and paste this link:
  </p>
  <p style="font-size: 13px; color: #1a6fc4; word-break: break-all;">
    ${verificationUrl}
  </p>
  <p style="font-size: 13px; color: #999;">
    This link will expire in 24 hours.
  </p>
</div>
`;

    await sendEmail(email, subject, text, html);
}