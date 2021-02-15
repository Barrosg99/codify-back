const router = require('express').Router();

const topicsController = require('../controllers/topicsController');

router.get('/:topicId/users/', async (req, res) => {
  const topicId = +req.params.topicId;
  const topic = await topicsController.getOneWithUserProgress(topicId, req.userId);

  res.send(topic);
});

module.exports = router;
