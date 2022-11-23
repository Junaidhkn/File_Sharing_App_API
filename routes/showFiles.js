const router = require('express').Router();
const File = require('../Model/file');

router.get('/:uuid', async (req, res) => {
	try {
		const file = await File.findOne({ uuid: req.params.uuid });
		if (!file) {
			return res.json({ error: 'File not found' });
		}
		return res.json({
			filename: file.filename,
			fileSize: file.size,
			uuid: file.uuid,
			downloadLink: `${process.env.APP_URL}/files/download/${file.uuid}`,
		});
	} catch (err) {
		return res.json({ error: err });
	}
});

module.exports = router;
