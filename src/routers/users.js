const router = require('express').Router();

router.post('/sign-in', async (req, res) => {
	const { email } = req.body;
	
	try {
		res.status(200).send('Deu bom!');
	}
	catch {
		res.sendStatus(500);
	}
});

module.exports = router;