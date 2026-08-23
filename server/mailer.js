const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || "ImmoBerlin <immoscout@berlin.de>";

async function sendMagicLink(email, link) {
  console.log("Sending magic link to:", email);
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Your Berlin Sublet login link",
    html: `<p>Click to login: <a href="${link}">${link}</a></p>`,
  });
  console.log("Resend response:", data, error);
}

async function sendListingInquiry({ to, ownerName, listingTitle, district, senderName, senderEmail, message }) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `New Berlin Sublet inquiry: ${listingTitle}`,
    html: [
      `<p>Hi ${ownerName || "there"},</p>`,
      `<p>You received a new inquiry for your listing "<strong>${listingTitle}</strong>" in ${district}.</p>`,
      `<p><strong>From:</strong> ${senderName} &lt;${senderEmail}&gt;</p>`,
      `<p><strong>Message:</strong></p>`,
      `<p>${message.replace(/\n/g, "<br/>")}</p>`,
      "<p>Reply directly to continue the conversation.</p>",
    ].join(""),
  });
}

module.exports = { sendMagicLink, sendListingInquiry };
