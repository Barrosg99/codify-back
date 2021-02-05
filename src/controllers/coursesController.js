/* eslint-disable class-methods-use-this */
const Course = require('../models/Course');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

class CoursesController {
  async getAll() {
    return Course.findAll();
  }

  async getOne(id) {
    const course = await Course.findByPk(id);
    if (!course) throw new NotFoundError('Course not found');

    return course;
  }

  async createCourse(title, description, color, imageUrl) {
    const course = await Course.findOne({ where: { title } });
    if (course !== null) throw new ConflictError('There is already a course with this title');

    const createdCourse = await Course.create({
      title, description, color, imageUrl,
    });

    return createdCourse;
  }

  async editCourse(id, title, description, color, imageUrl) {
    const course = await Course.findByPk(id);
    if (!course) throw new NotFoundError('Course not found');

    course.title = title;
    course.description = description;
    course.color = color;
    course.imageUrl = imageUrl;

    await course.save();
    return course;
  }

  async deleteCourse(id) {
    const course = await Course.findByPk(id);
    if (!course) throw new NotFoundError('Course not found');

    await course.destroy({ where: { id } });
    return course;
  }

  count() {
    return Course.count();
  }
}

module.exports = new CoursesController();
