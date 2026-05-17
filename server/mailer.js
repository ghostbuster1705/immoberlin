const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

async function sendEmail(options) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@berlinsublet.com",
    ...options,
  });

  if (info.message) {
    console.log("Email payload (json transport):", info.message.toString());
  }
}

module.exports = { sendEmail };
