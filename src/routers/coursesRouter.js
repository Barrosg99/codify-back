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

module.exports = router;
