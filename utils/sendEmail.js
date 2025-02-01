// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendThankYouEmail = (email, firstName) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service (e.g., Gmail, SendGrid, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: email, // Recipient address
    subject: "Thank You for Registering with CPA Network", // Subject line
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi ${firstName},</h2>
        <p>Thank you for registering with CPA Network! Your account is currently pending approval. We will notify you once your account is approved.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,</p>
        <p><strong>CPA Network Team</strong></p>
      </div>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendThankYouEmail;