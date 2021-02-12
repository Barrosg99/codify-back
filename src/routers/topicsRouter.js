const router = require('express').Router();

const topicsController = require('../controllers/topicsController');

router.get('/:id', async (req, res) => {
  const id = +req.params.id;

  const topic = await topicsController.getOne(id);

  res.send(topic);
});

module.exports = router;
