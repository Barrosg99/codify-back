const router = require('express').Router();
const userSchemas = require('../../schemas/usersSchemas');
const usersController = require('../../controllers/usersController');
const AuthError = require('../../errors/AuthError');
const { verifyJWT } = require('../../middlewares');

router.post('/sign-in', async (req, res) => {
  const { error } = userSchemas.adminSignIn.validate(req.body);
  if (error) return res.sendStatus(422);

  const { username, password } = req.body;

  try {
    return res.status(201).send(await usersController.postAdminSignIn(username, password));
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) return res.status(403).send(err.message);
    return res.sendStatus(500);
  }
});

router.post('/sign-out', verifyJWT, async (req, res) => {
  try {
    await usersController.postAdminSignOut(req.sessionId);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) res.status(403).send(err.message);
    else res.sendStatus(500);
  }
});

module.exports = router;
