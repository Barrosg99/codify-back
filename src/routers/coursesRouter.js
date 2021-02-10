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

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const course = await coursesController.getOne(id);

  res.send(course);
});

module.exports = router;
