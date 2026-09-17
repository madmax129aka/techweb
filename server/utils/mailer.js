const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    // No SMTP credentials configured - transporter stays null and we log instead.
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured, otherwise logs it to the console.
 * This keeps the prototype runnable without needing real credentials.
 */
async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();

  if (!t) {
    console.log("\n----- MOCK EMAIL (SMTP not configured) -----");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:\n", text || html);
    console.log("----------------------------------------------\n");
    return { mocked: true };
  }

  return t.sendMail({
    from: process.env.MAIL_FROM || "TechAstra <no-reply@techastra.dev>",
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
