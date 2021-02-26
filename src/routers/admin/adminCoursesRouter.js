const router = require('express').Router();

const coursesController = require('../../controllers/coursesController');
const coursesSchemas = require('../../schemas/coursesSchemas');
const querySchema = require('../../schemas/querySchema');

router.get('/', async (req, res) => {
  const { error, value } = querySchema.validate(req.query, { allowUnknown: true });
  if (error) return res.status(422).send({ error: error.details[0].message });
  const { rows, count } = await coursesController.getAllAdmin(value);
  res
    .header('Access-Control-Expose-Headers', 'X-Total-Count')
    .set('X-Total-Count', count)
    .send(rows);
});

router.get('/:id', async (req, res) => {
  const course = await coursesController.getOne(+req.params.id);
  res.send(course);
});

router.post('/', async (req, res) => {
  const { error } = coursesSchemas.courseSchema.validate(req.body);
  if (error) return res.sendStatus(422);

  const {
    title, description, color, imageUrl,
  } = req.body;

  const createdCourse = await coursesController.createCourse(title, description, color, imageUrl);
  res.status(201).send(createdCourse);
});

router.put('/:id', async (req, res) => {
  const { error } = coursesSchemas.courseSchema.validate(req.body);
  if (error) return res.sendStatus(422);

  const { id } = req.params;
  const {
    title, description, color, imageUrl,
  } = req.body;

  const course = await coursesController.editCourse(+id, title, description, color, imageUrl);
  res.status(200).send(course);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const course = await coursesController.deleteCourse(+id);
  res.status(204).send(course);
});

module.exports = router;
