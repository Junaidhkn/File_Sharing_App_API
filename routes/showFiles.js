const router = require('express').Router();
const File = require('../Model/file');

router.get('/:uuid', async (req, res) => {
	try {
		const file = await File.findOne({ uuid: req.params.uuid });
		if (!file) {
			return res.render('download', { error: 'File not found' });
		}
		return res.render('download', {
			filename: file.filename,
			fileSize: file.size,
			uuid: file.uuid,
			downloadLink: `${process.env.APP_URL}/files/download/${file.uuid}`,
		});
	} catch (err) {
		return res.render('error', { error: err });
	}
});

module.exports = router;
