const router = require('express').Router();
const topicsController = require('../../controllers/topicsController');

router
  .get('/', async (req, res) => {
    const { rows, count } = await topicsController.getAll(req.query);
    res
      .header('Access-Control-Expose-Headers', 'X-Total-Count')
      .set('X-Total-Count', count)
      .send(rows);
  })
  .get('/:id', async (req, res) => {
    res.send(await topicsController.getOne(+req.params.id));
  })
  .put('/:id', async (req, res) => {
    res.send(await topicsController.editTopic(req.body));
  })
  .post('/', async (req, res) => {
    res.send(await topicsController.createTopic(req.body));
  })
  .delete('/:id', async (req, res) => {
    res.send(await topicsController.deleteTopic(+req.params.id));
  });

module.exports = router;
