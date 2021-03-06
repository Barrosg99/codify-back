const router = require('express').Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const usersController = require('../../controllers/usersController');
const topicsController = require('../../controllers/topicsController');
const theoriesController = require('../../controllers/theoriesController');
const coursesController = require('../../controllers/coursesController');
const exercisesController = require('../../controllers/exercisesController');

const registerSchema = require('../../schemas/registerSchema');
const exerciseSchema = require('../../schemas/exerciseSchema');
const signInSchema = require('../../schemas/signInSchema');
const userSchemas = require('../../schemas/usersSchemas');
const { verifyJWT } = require('../../middlewares');

router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(422).send({ error: error.details[0].message });

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

router.get('/courses/:courseId/progress', verifyJWT, async (req, res) => {
  const courseId = +req.params.courseId;

  const userProgress = await coursesController.getCourseProgress(req.userId, courseId);
  res.send(userProgress);
});

router.post('/theories/:theoryId/progress', verifyJWT, async (req, res) => {
  const theoryId = +req.params.theoryId;

  const userHasDone = await theoriesController.postTheoryProgress(req.userId, theoryId);

  if (userHasDone) res.sendStatus(201);
  else res.sendStatus(204);
});

router.post('/exercises/:exerciseId/progress', verifyJWT, async (req, res) => {
  const { error } = exerciseSchema.validate(req.body);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const exerciseId = +req.params.exerciseId;
  const { solutionUser } = req.body;

  const userHasDone = await exercisesController.postExerciseProgress(
    req.userId,
    exerciseId,
    solutionUser,
  );

  if (userHasDone) res.sendStatus(201);
  else res.sendStatus(204);
});

router.post('/topics/:topicId/progress', verifyJWT, async (req, res) => {
  const topicId = +req.params.topicId;

  const result = await topicsController.postTopicProgress(req.userId, topicId);
  res.send(result);
});

router.get('/courses/ongoing', verifyJWT, async (req, res) => {
  const ongoingCourses = await coursesController.getOngoingCoursesByUser(req.userId);
  res.status(200).send(ongoingCourses);
});

router.post('/signOut', verifyJWT, async (req, res) => {
  await usersController.postUserSignOut(req.sessionId);
  res.sendStatus(204);
});

router.post('/forgot-password', async (req, res) => {
  const { error } = userSchemas.recoveryEmail.validate(req.body);
  if (error) return res.status(422).json({ error: error.details[0].message });

  await usersController.sendPwdRecoveryEmail(req.body.email);

  res.sendStatus(204);
});

router.put('/password-reset', verifyJWT, async (req, res) => {
  const { error } = userSchemas.newPassword.validate(req.body);
  if (error) return res.status(422).json({ error: error.details[0].message });

  await usersController.changePassword(req.userId, req.sessionId, req.body.password);

  res.sendStatus(204);
});

router.put('/', verifyJWT, async (req, res) => {
  const { error } = userSchemas.updateUser.validate(req.body);
  if (error) return res.status(422).json({ error: error.details[0].message });

  await usersController.changeUserData(req.userId, req.body);
  res.sendStatus(204);
});

router.post('/avatar', verifyJWT, upload.single('image'), async (req, res) => {
  res.send(await usersController.changeAvatar(req.userId, req.file));
});

module.exports = router;
