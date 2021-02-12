const router = require('express').Router();
const topicsController = require('../../controllers/topicsController');
const querySchema = require('../../schemas/querySchema');

router
  .get('/', async (req, res) => {
    const { error, value } = querySchema.validate(req.query);
    if (error) return res.status(422).send({ error: error.details[0].message });

    const { rows, count } = await topicsController.getAll(value);
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
