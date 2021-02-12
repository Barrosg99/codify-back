const router = require('express').Router();
const usersController = require('../controllers/usersController');
const registerSchema = require('../schemas/registerSchema');
const signInSchema = require('../schemas/signInSchema');
const { verifyJWT, verifyClient } = require('../middlewares');

router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(422).send({ error: error.details[0].message });
  if (await usersController.findByEmail(req.body.email)) return res.status(409).send({ error: 'Email already in use' });

  const user = await usersController.create(req.body);
  return res.status(201).send(user);
});

router.post('/sign-in', async (req, res) => {
  const { error } = signInSchema.validate(req.body);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const { email, password } = req.body;
  const session = await usersController.createSession(email, password);

  return res.status(201).send(session);
});

router.get('/:userId/courses/:courseId/progress', verifyJWT, verifyClient, async (req, res) => {
  const [userId, courseId] = [+req.params.userId, +req.params.courseId];

  const userProgress = await usersController.getCourseProgress(userId, courseId);
  res.send(userProgress);
});

router.get('/:id/courses/ongoing', verifyJWT, verifyClient, async (req, res) => {
  const id = parseInt(req.params.id);
  const ongoingCourses = await usersController.getOngoingCoursesByUser(id);
  res.status(200).send(ongoingCourses);
});

router.post('/signOut', verifyJWT, verifyClient, async (req, res) => {
  await usersController.postUserSignOut(req.sessionId);
  res.sendStatus(204);
});

module.exports = router;
