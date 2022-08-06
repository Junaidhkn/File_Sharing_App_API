const express = require('express');
const multer = require('multer');
const path = require('path');
const File = require('../Model/file');
const { v4: uuid4 } = require('uuid');
const sendEmail = require('../services/emailService');

const router = express.Router();

let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'upload/');
	},
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${Math.round(
			Math.random() * 1e5,
		)}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 1e7 },
}).single('myfile');

router.post('/', (req, res) => {
	// Store File
	upload(req, res, async (err) => {
		// Validate Request
		if (!req.file) {
			return res.json({ error: 'All fields are required.' });
		}
		if (err) {
			return res.status(500).send({ error: err.message });
		}
		// Store into the Database
		const file = new File({
			filename: req.file.filename,
			uuid: uuid4(),
			path: req.file.path,
			size: req.file.size,
		});
		const response = await file.save();
		return res.json({ file: `${process.env.APP_URL}/files/${response.uuid}` });
	});

	// Response Link
});

router.post('/send', async (req, res) => {
	const { uuid, emailTo, emailFrom, title, description } = req.body;

	if (!uuid || !emailTo || !emailFrom) {
		return res.status(400).json({ error: 'All fields are required.' });
	}

	const file = await File.findOne({ uuid: uuid });
	if (!file) {
		return res.status(400).json({ error: 'File not found.' });
	}
	file.sender = emailFrom;
	file.receiver = emailTo;
	file.title = title;
	file.description = description;

	const response = await file.save();

	// Send Email
	sendEmail({
		from: emailFrom,
		to: emailTo,
		Subject: title,
		description: description,
		html: require('../services/emailTemplate')({
			emailFrom: emailFrom,
			Subject: title,
			description: description,
			downloadLink: `${process.env.APP_URL}/files/download/${file.uuid}`,
			size: parseInt(file.size / 1000) + ' KB',
			expires: '24 hours',
		}),
	});
	return res.send({ success: true });
});
module.exports = router;
