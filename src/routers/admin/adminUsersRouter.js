const router = require('express').Router();
const userSchemas = require('../../schemas/usersSchemas');
const usersController = require('../../controllers/usersController');
const AuthError = require('../../errors/AuthError');
const { verifyJWT } = require('../../middlewares');

router.post('/sign-in', async (req, res) => {
  const { error } = userSchemas.adminSignIn.validate(req.body);
  if (error) return res.sendStatus(422);

  const { username, password } = req.body;
  res.status(200).send(await usersController.postAdminSignIn(username, password));
});

router.post('/sign-out', verifyJWT, async (req, res) => {
  await usersController.postAdminSignOut(req.sessionId);
  res.sendStatus(204);
});

module.exports = router;
