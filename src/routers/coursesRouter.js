const router = require('express').Router();
const coursesController = require('../controllers/coursesController');

router.get('/', async (req, res) => {
  try {
    res.status(200).send(await coursesController.getAll());
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get('/suggestions', async (req, res) => {
  const limit = 6;
  res.status(200).send(await coursesController.getSuggestions(limit));
});

router.post('/:courseId/users', async (req, res) => {
  const { courseId } = req.params;
  console.log(req.userId);
  await coursesController.initCouserByUserId(+courseId, req.userId);
  res.sendStatus(200);
});

router.get('/:courseId/chapters', async (req, res) => {
  const { courseId } = req.params;

  const topics = await coursesController
    .getAllTopicsAtChapterFromUser(+courseId, req.userId);
  res.send(topics);
});

module.exports = router;
