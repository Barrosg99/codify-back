const router = require('express').Router();

const coursesController = require('../../controllers/coursesController');
const coursesSchemas = require('../../schemas/coursesSchemas');

router.get('/', async (req, res) => {
  const courses = await coursesController.getAll();
  res.send(courses);
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const course = await coursesController.getOne(id);
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

  await coursesController.deleteCourse(+id);
  res.sendStatus(204);
});

module.exports = router;
