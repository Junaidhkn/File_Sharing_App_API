const nodemailer = require('nodemailer');

const sendEmail = async ({ from, to, subject, html }) => {
	let transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: false,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		},
	});
	let info = await transporter.sendMail({
		from: `ShareME <${from}>`,
		to,
		subject,
		html,
	});
};

module.exports = sendEmail;
