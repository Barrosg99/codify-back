const router = require('express').Router();
const theoriesController = require('../../controllers/theoriesController');

router
  .get('/', async (req, res) => {
    const { rows, count } = await theoriesController.getAll(req.query);
    res
      .header('Access-Control-Expose-Headers', 'X-Total-Count')
      .set('X-Total-Count', count)
      .send(rows);
  })
  .get('/:id', async (req, res) => {
    res.send(await theoriesController.getOne(+req.params.id));
  })
  .put('/:id', async (req, res) => {
    res.send(await theoriesController.editTheory(req.body));
  })
  .post('/', async (req, res) => {
    res.send(await theoriesController.createTheory(req.body));
  })
  .delete('/:id', async (req, res) => {
    const deletedTheory = await theoriesController.deleteTheory(+req.params.id);
    res.send(deletedTheory[1][0]);
  });
module.exports = router;
