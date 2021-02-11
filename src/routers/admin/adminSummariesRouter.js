const router = require('express').Router();
const summariesController = require('../../controllers/summariesController');

router
  .post('/', async (req, res) => {
    res.send(await summariesController.createSummary(req.body));
  })
  .get('/', async (req, res) => {
    const { rows, count } = await summariesController.getAll(req.query);
    res
      .header('Access-Control-Expose-Headers', 'X-Total-Count')
      .set('X-Total-Count', count)
      .send(rows);
  })
  .get('/:id', async (req, res) => {
    res.send(await summariesController.getOne(+req.params.id));
  })
  .put('/:id', async (req, res) => {
    const up = await summariesController.editSummary(req.body);
    res.send(up);
  })
  .delete('/:id', async (req, res) => {
    const deletedSummary = await summariesController.deleteSummary(+req.params.id);
    res.send(deletedSummary[1][0]);
  });

module.exports = router;
