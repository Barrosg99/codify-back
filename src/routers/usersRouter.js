const router = require('express').Router();
const usersController = require('../controllers/usersController');
const registerSchema = require('../schemas/registerSchema');

router
	.post('/register', async (req, res) => {
		const { error } = registerSchema.validate(req.body);
		if (error) return res.status(422).send({ error: error.details[0].message });
		if (await usersController.findEmail(req.body.email)) return res.status(409).send({ error: 'Email already in use' });

		const user = await usersController.create(req.body);
		return res.status(201).send(user);
	});

module.exports = router;