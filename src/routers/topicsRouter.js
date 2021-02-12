const router = require('express').Router();

const topicsController = require('../controllers/topicsController');

router.get('/:topicId/users/:userId', async (req, res) => {
  const [topicId, userId] = [+req.params.topicId, +req.params.userId];

  const topic = await topicsController.getOne(topicId, userId);

  res.send(topic);
});

module.exports = router;
