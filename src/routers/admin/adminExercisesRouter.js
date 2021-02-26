const router = require('express').Router();
const exercisesController = require('../../controllers/exercisesController');
const querySchema = require('../../schemas/querySchema');

router
  .get('/', async (req, res) => {
    const { error, value } = querySchema.validate(req.query, { allowUnknown: true });
    if (error) return res.status(422).send({ error: error.details[0].message });

    const { rows, count } = await exercisesController.getAll(value);

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
    res.send(await exercisesController.createExercise(req.body));
  })
  .delete('/:id', async (req, res) => {
    res.send(await exercisesController.deleteExercise(+req.params.id));
  });

module.exports = router;
