const router = require('express').Router();
const userSchemas = require('../../schemas/usersSchemas');
const usersController = require('../../controllers/usersController');
const AuthError = require('../../errors/AuthError');

router.post('/sign-in', async (req, res) => {
  const { error } = userSchemas.adminSignIn.validate(req.body);
  if (error) return res.sendStatus(422);

  const { username, password } = req.body;
  console.log(username);

  try {
    res.status(201).send(await usersController.postAdminSignIn(username, password));
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) res.status(403).send(err.message);
    else res.sendStatus(500);
  }
});

module.exports = router;
