const router = require('express').Router();

const coursesController = require('../../controllers/coursesController');
const coursesSchemas = require('../../schemas/coursesSchemas');

router.get('/', async (req, res) => {
  const total = await coursesController.count();
  const courses = await coursesController.getAll();
  res
    .header('Access-Control-Expose-Headers', 'X-Total-Count')
    .set('X-Total-Count', total)
    .send(courses);
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
