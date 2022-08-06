const router = require('express').Router();
const File = require('../Model/file');

router.get('/:uuid', async (req, res) => {
	const file = await File.findOne({ uuid: req.params.uuid });
	if (!file) return res.render('error', { error: 'File not found' });

	const filepath = path.join(__dirname, '..', 'uploads', file.filename);
	res.download(filepath);
});

module.exports = router;
