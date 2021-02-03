const router = require('express').Router();

const coursesController = require('../../controllers/coursesController');
const ConflictError = require('../../errors/ConflictError');
const NotFoundError = require('../../errors/NotFoundError');
const coursesSchemas = require('../../schemas/coursesSchemas');
const { verifyJWT } = require('../../midllewares/validation');

router.post('/', async (req, res) => {
  const { error } = coursesSchemas.courseSchema.validate(req.body);
  if (error) return res.sendStatus(422);

  const { title, description, color, imageUrl } = req.body;

  try {
    const createdCourse = await coursesController.createCourse(title, description, color, imageUrl);

    res.status(201).send(createdCourse);
  } catch (err) {
    console.log(err);
    if (err instanceof ConflictError) return res.status(409).send(err.message);
    else res.sendStatus(500);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = coursesSchemas.courseSchema.validate(req.body);
  if (error) return res.sendStatus(422);

  let { id } = req.params;
  id = parseInt(id);

  const { title, description, color, imageUrl } = req.body;

  try {
    res.status(200).send(await coursesController.editCourse(id, title, description, color, imageUrl));
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) return res.status(404).send(err.message);
    else res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  let { id } = req.params;
  id = parseInt(id);

  try {
    await coursesController.deleteCourse(id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    if (err instanceof NotFoundError) return res.status(404).send(err.message);
    else res.sendStatus(500);
  }
});

module.exports = router;
