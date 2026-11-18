const nodemailer = require('nodemailer');

// In mock mode (EMAIL_MOCK=true or no SMTP config), just log to console
const transporter = (process.env.EMAIL_MOCK === 'true' || !process.env.SMTP_HOST)
  ? { sendMail: async (o) => console.log(`\n📧 [EMAIL] To: ${o.to} | Subject: ${o.subject}\n`) }
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

const FROM = process.env.EMAIL_FROM || 'HelpDesk Pro <noreply@helpdesk.com>';

const send = async (to, subject, text) => {
  try { await transporter.sendMail({ from: FROM, to, subject, text }); }
  catch (e) { console.error('Email error:', e.message); }
};

module.exports = {
  notifyTicketCreated:  (t, u) => send(u.email, `[#${t.id.slice(0,8)}] Ticket created: ${t.title}`,    `Hi ${u.name},\n\nYour ticket "${t.title}" (priority: ${t.priority}) has been received.\n\n— HelpDesk Pro`),
  notifyTicketAssigned: (t, u) => send(u.email, `[#${t.id.slice(0,8)}] Assigned to you: ${t.title}`,   `Hi ${u.name},\n\nA ticket has been assigned to you: "${t.title}".\n\n— HelpDesk Pro`),
  notifyStatusChanged:  (t, u, old) => send(u.email, `[#${t.id.slice(0,8)}] Status update: ${t.title}`, `Hi ${u.name},\n\nYour ticket status changed: ${old} → ${t.status}.\n\n— HelpDesk Pro`),
};
