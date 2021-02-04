const router = require('express').Router();

const coursesController = require('../../controllers/coursesController');
const ConflictError = require('../../errors/ConflictError');
const NotFoundError = require('../../errors/NotFoundError');
const coursesSchemas = require('../../schemas/coursesSchemas');

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

  try {
    const createdCourse = await coursesController.createCourse(title, description, color, imageUrl);

    res.status(201).send(createdCourse);
  } catch (err) {
    console.log(err);
    if (err instanceof ConflictError) return res.status(409).send(err.message);
    res.sendStatus(500);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = coursesSchemas.courseSchema.validate(req.body);
  if (error) return res.sendStatus(422);

  const { id } = req.params;

  const {
    title, description, color, imageUrl,
  } = req.body;

  try {
    const course = await coursesController.editCourse(+id, title, description, color, imageUrl);
    res.status(200).send(course);
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) return res.status(404).send(err.message);
    res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await coursesController.deleteCourse(+id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) return res.status(404).send(err.message);
    res.sendStatus(500);
  }
});

module.exports = router;
