import nodemailer from "nodemailer";


// here we are using gemail app password for authentication
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user:
            process.env.EMAIL_HOST_USER,
        pass:
            process.env.EMAIL_HOST_PASSWORD,
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log("Error setting up email transporter:", error);
    } else {
        console.log("Email transporter is ready to send messages");
    }
})

// Function to send email
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    const info =
      await transporter.sendMail({
        from: `"Adarsh Maurya" <${process.env.EMAIL_HOST_USER}>`,
        to,
        subject,
        text,
        html,
      });

    console.log(
      "Email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Email sending failed:",
      error
    );

    throw new Error(
      "Failed to send email"
    );
  }
};

export default sendEmail;