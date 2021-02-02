const router = require('express').Router();
const usersController = require('../controllers/usersController');
const registerSchema = require('../schemas/registerSchema');
const signInSchema = require('../schemas/signInSchema');

router
	.post('/register', async (req, res) => {
		const { error } = registerSchema.validate(req.body);
		if (error) return res.status(422).send({ error: error.details[0].message });

		if (usersController.findEmail(req.body.email)) return res.status(409).send({ error: 'Email already in use' });

	});

router
	.post('/sign-in', async (req, res) => {
		const { error } = signInSchema.validate(req.body);
		if (error) return res.status(422).send({ error: error.details[0].message });

		const { email, password } = req.body;		
		const session = usersController.createSession(email, password);

		res.status(201).send(session);
	});

module.exports = router;