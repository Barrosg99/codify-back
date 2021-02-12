const router = require('express').Router();
const exercisesController = require('../../controllers/exercisesController');

router
  .get('/', async (req, res) => {
    const { rows, count } = await exercisesController.getAll(req.query);
    res
      .header('Access-Control-Expose-Headers', 'X-Total-Count')
      .set('X-Total-Count', count)
      .send(rows);
  })
  .get('/:id', async (req, res) => {
    res.send(await exercisesController.getOne(+req.params.id));
  })
  .put('/:id', async (req, res) => {
    res.send(await exercisesController.editExercise(req.body));
  })
  .post('/', async (req, res) => {
    res.send(await exercisesController.creteExercise(req.body));
  })
  .delete('/:id', async (req, res) => {
    res.send(await exercisesController.deleteExercise(+req.params.id));
  });

module.exports = router;
