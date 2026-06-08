import sendEmail from "../services/email.service";

export const sendResetPasswordEmail = async (
  email: string,
  token: string
) => {
  const resetPasswordUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  const subject = "Reset Your Password";

  const text = `
We received a request to reset your password.

Click the link below to reset your password:

${resetPasswordUrl}

This link expires in 1 hour.

If you did not request this, you can safely ignore this email.
`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <h2 style="font-size: 22px; font-weight: 600;">
    Reset Your Password
  </h2>

  <p style="font-size: 15px; color: #555; line-height: 1.6;">
    We received a request to reset your password.
    Click the button below to create a new password.
  </p>

  <!-- Bulletproof button -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius: 8px; background: #000000;">
        <a
          href="${resetPasswordUrl}"
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
            text-align: center;
          "
        >
          Reset Password
        </a>
      </td>
    </tr>
  </table>

  <p style="font-size: 13px; color: #999; margin-top: 28px;">
    Or copy and paste this link:
  </p>

  <p style="font-size: 13px; color: #1a6fc4; word-break: break-all;">
    ${resetPasswordUrl}
  </p>

  <p style="font-size: 13px; color: #999;">
    This link will expire in 15 minutes.
  </p>

  <p style="font-size: 13px; color: #999;">
    If you did not request a password reset, you can safely ignore this email.
  </p>
</div>
`;

  await sendEmail(email, subject, text, html);
};