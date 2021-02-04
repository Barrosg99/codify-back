const router = require('express').Router();
const userSchemas = require('../../schemas/usersSchemas');
const usersController = require('../../controllers/usersController');
const AuthError = require('../../errors/AuthError');
const verifyJwt = require('../../midllewares/validation');

router.post('/sign-in', async (req, res) => {
  const { error } = userSchemas.adminSignIn.validate(req.body);
  if (error) return res.sendStatus(422);

  const { username, password } = req.body;
  console.log(username);

  try {
    return res.status(201).send(await usersController.postAdminSignIn(username, password));
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) return res.status(403).send(err.message);
    return res.sendStatus(500);
  }
});

router.post('/sign-out', verifyJwt, async (req, res) => {
  try {
    await usersController.postAdminSignOut(req.userId);
    res.status(204);
  } catch (err) {
    console.error(err);
    if (err instanceof AuthError) res.status(403).send(err.message);
    else res.sendStatus(500);
  }
});

module.exports = router;
