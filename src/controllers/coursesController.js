const Course = require('../models/Course');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

async function getAll() {
  return Course.findAll();
}

async function createCourse(title, description, color, imageUrl) {
  const curso = await Course.findOne({ where: { title } });
  if (curso !== null) throw new ConflictError('There is already a course with this title');

  const createdCurso = await Course.create({
    title, description, color, imageUrl,
  });

  return createdCurso;
}

async function editCourse(id, title, description, color, imageUrl) {
  const course = await Course.findByPk(id);
  if (!course) throw new NotFoundError('Course not found');

  course.title = title;
  course.description = description;
  course.color = color;
  course.imageUrl = imageUrl;

  await course.save();
  return course;
}

async function deleteCourse(id) {
  const course = await Course.findByPk(id);
  if (!course) throw new NotFoundError('Course not found');

  await course.destroy({ where: { id } });
}
module.exports = {
  getAll, createCourse, editCourse, deleteCourse,
};
