const router = require('express').Router();

const usersController = require('../controllers/users');

router.post('/sign-in', async (req, res) => {
	const { email, password } = req.body;
	
	try {
		const session = usersController.createSession(email, password);

		res.status(201).send(session);
	}
	catch {
		res.sendStatus(500);
	}
});

module.exports = router;