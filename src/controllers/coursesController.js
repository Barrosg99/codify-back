/* eslint-disable class-methods-use-this */
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const TopicUser = require('../models/TopicUser');
const User = require('../models/User');
const CourseUser = require('../models/CourseUser');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

class CoursesController {
  async getAll() {
    return Course.findAll();
  }

  async getOne(id) {
    const course = await Course.findByPk(id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [[{ model: Chapter }, 'order', 'ASC']],
      include: {
        model: Chapter,
        attributes: {
          exclude: ['courseId', 'order', 'createdAt', 'updatedAt'],
        },
      },
    });

    if (!course) throw new NotFoundError('Course not found');

    return course;
  }

  async createCourse(title, description, color, imageUrl) {
    const course = await Course.findOne({ where: { title } });
    if (course !== null) throw new ConflictError('There is already a course with this title');

    return Course.create({
      title, description, color, imageUrl,
    });
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

  async initCouserByUserId(courseId, userId) {
    const course = await Course.findByPk(courseId);
    const user = await User.findByPk(userId);

    if (!course || !user) throw new NotFoundError();
    return CourseUser.create({ courseId, userId });
  }

  getAllTopicsAtChapterFromUser(courseId, chapterId, userId) {
    return Chapter.findByPk(chapterId, {
      where: { courseId },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'courseId'],
      },
      include: {
        model: Topic,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        include: {
          model: TopicUser,
          attributes: ['userId'],
          where: { userId },
          required: false,
        },
      },
    });
  }
}

module.exports = new CoursesController();
