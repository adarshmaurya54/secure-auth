import sendEmail from "../services/email.service";

export const sendVerificationEmail = async (
    email: string,
    code: string
) => {
    const subject = "Verify your email address";

    const text = `
Welcome!

Your email verification code is:

${code}

This code expires in 10 minutes.

If you did not create an account, you can safely ignore this email.
`;

    const html = `
<div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 20px;
">
    <h2 style="
        font-size: 24px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 12px;
    ">
        Verify Your Email
    </h2>

    <p style="
        font-size: 15px;
        color: #555;
        line-height: 1.7;
        margin-bottom: 20px;
    ">
        Thank you for registering.
        Use the verification code below
        to verify your email address.
    </p>

    <div style="
        background: #f5f5f5;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin: 24px 0;
    ">
        <p style="
            margin: 0;
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        ">
            Your verification code
        </p>

        <h1 style="
            margin: 0;
            font-size: 36px;
            letter-spacing: 8px;
            font-weight: bold;
            color: #111827;
        ">
            ${code}
        </h1>
    </div>

    <p style="
        font-size: 14px;
        color: #666;
        line-height: 1.6;
    ">
        This code will expire in
        <strong>10 minutes</strong>.
    </p>

    <p style="
        font-size: 13px;
        color: #999;
        margin-top: 28px;
    ">
        If you did not create an account,
        you can safely ignore this email.
    </p>
</div>
`;

    await sendEmail(
        email,
        subject,
        text,
        html
    );
};