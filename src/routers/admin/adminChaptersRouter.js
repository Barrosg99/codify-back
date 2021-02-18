const router = require('express').Router();
const chaptersController = require('../../controllers/chaptersController');
const querySchema = require('../../schemas/querySchema');

router
  .post('/', async (req, res) => {
    res.status(201).send(await chaptersController.createChapter(req.body));
  })
  .get('/', async (req, res) => {
    const { error, value } = querySchema.validate(req.query);
    if (error) return res.status(422).send({ error: error.details[0].message });

    const { rows, count } = await chaptersController.getAll(value);
    res
      .header('Access-Control-Expose-Headers', 'X-Total-Count')
      .set('X-Total-Count', count)
      .send(rows);
  })
  .get('/:id', async (req, res) => {
    res.send(await chaptersController.getOne(+req.params.id));
  })
  .put('/:id', async (req, res) => {
    res.send(await chaptersController.editChapter(req.body));
  })
  .delete('/:id', async (req, res) => {
    const deletedChapter = await chaptersController.deleteChapter(+req.params.id);
    res.send(deletedChapter[1][0]);
  });

module.exports = router;
