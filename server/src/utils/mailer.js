const nodemailer = require('nodemailer');

function createTransport() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	return nodemailer.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined });
}

async function sendInviteEmail(toEmail, link) {
	const transporter = createTransport();
	const from = process.env.SMTP_FROM || 'no-reply@example.com';
	await transporter.sendMail({
		from,
		to: toEmail,
		subject: 'You are invited to join the Chat & Calls app',
		html: `<p>Hello,</p><p>You have been invited to join our chat and calling app.</p><p><a href="${link}">Click here to register</a></p>`
	});
}

module.exports = { sendInviteEmail };
