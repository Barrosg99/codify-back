const router = require('express').Router();
const chaptersController = require('../../controllers/chaptersController');

router
  .post('/', async (req, res) => {
    res.send(await chaptersController.createChapter(req.body));
  })
  .get('/', async (req, res) => {
    const { rows, count } = await chaptersController.getAll(req.query);
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
