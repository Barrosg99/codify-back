/* eslint-disable no-await-in-loop */
const { Op } = require('sequelize');
const {
  CourseUser, User, TopicUser, Topic, Chapter, Course,
} = require('../models');
const { ConflictError, NotFoundError } = require('../errors');
const topicsController = require('./topicsController');

class CoursesController {
  getAll() {
    return Course.findAll({
      where: { excluded: false },
      include: {
        model: Chapter,
        attributes: [],
        required: true,
        where: {
          topicsQuantity: {
            [Op.gt]: 0,
          },
          exercisesQuantity: {
            [Op.gt]: 0,
          },
          theoryQuantity: {
            [Op.gt]: 0,
          },
        },
      },
    });
  }

  getAllAdmin({
    _end, _start, _order, _sort,
  }) {
    const limit = _end ? _end - _start : null;
    const options = {
      limit,
      offset: _start,
      order: [[_sort, _order]],
      where: { excluded: false },
    };
    return Course.findAndCountAll(options);
  }

  async getOne(id) {
    const course = Course.findByPk(id);

    if (!course) throw new NotFoundError();

    return course;
  }

  async getAllTopicsAtChapterFromUser(courseId, userId) {
    const course = await Course.findByPk(courseId, {
      where: { excluded: false },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [[{ model: Chapter }, 'order', 'ASC']],
      include: {
        model: Chapter,
        attributes: {
          exclude: ['courseId', 'createdAt', 'updatedAt'],
        },
        where: {
          topicsQuantity: {
            [Op.gt]: 0,
          },
          exercisesQuantity: {
            [Op.gt]: 0,
          },
          theoryQuantity: {
            [Op.gt]: 0,
          },
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
      },
    });

    if (!course || course.chapters.length === 0) {
      return course;
    }

    let lastTopicId = course.chapters[0].topics[0].id;
    course.chapters.forEach((c) => {
      c.topics.forEach((t) => {
        if (t.topicUsers.length > 0) {
          t.dataValues.userHasFinished = true;
          lastTopicId = t.id;
        } else t.dataValues.userHasFinished = false;
        delete t.dataValues.topicUsers;
      });
    });
    course.dataValues.lastTopicId = lastTopicId;

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
    return Course.update({ excluded: true }, {
      where: { id },
      returning: true,
      raw: true,
    });
  }

  async getSuggestions(limit = Infinity) {
    return Course.findAll({
      limit,
      include: {
        model: Chapter,
        attributes: [],
        required: true,
        where: {
          topicsQuantity: {
            [Op.gt]: 0,
          },
          exercisesQuantity: {
            [Op.gt]: 0,
          },
          theoryQuantity: {
            [Op.gt]: 0,
          },
        },
      },
    });
  }

  async initCouserByUserId(courseId, userId) {
    const course = await Course.findByPk(courseId);
    const user = await User.findByPk(userId);
    if (!course || !user) throw new NotFoundError();

    user.update({ hasInitAnyCourse: true });

    return CourseUser.findOrCreate({ where: { courseId, userId } });
  }

  async getCourseProgress(userId, courseId) {
    let userProgress;
    let hasStarted = false;

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);
    if (!user) throw new NotFoundError('User not found');
    if (!course) throw new NotFoundError('Course not found');

    const userCourseData = await CourseUser.findOne({ where: { userId, courseId } });
    if (!userCourseData) userProgress = 0;
    else {
      const totalExercises = await Chapter.sum(
        'exercisesQuantity',
        { where: { courseId } },
      );
      const totalTheories = await Chapter.sum(
        'theoryQuantity',
        { where: { courseId } },
      );
      const totalTopics = totalExercises + totalTheories;

      hasStarted = true;
      userProgress = Math.floor((userCourseData.doneActivities / totalTopics) * 100);
    }

    return {
      userId,
      courseId,
      hasStarted,
      progress: userProgress,
    };
  }

  async getOngoingCoursesByUser(userId) {
    const courses = await Course.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'excluded'],
      },
      where: { excluded: false },
      include: [
        {
          model: User,
          attributes: ['id', 'hasInitAnyCourse'],
          required: true,
          through: {
            model: CourseUser,
            attributes: ['userId'],
            where: {
              userId,
            },
            order: [
              ['updatedAt', 'DESC'],
            ],
          },
        },
        {
          model: Chapter,
          attributes: [],
          required: true,
          where: {
            topicsQuantity: {
              [Op.gt]: 0,
            },
            exercisesQuantity: {
              [Op.gt]: 0,
            },
            theoryQuantity: {
              [Op.gt]: 0,
            },
          },
        },
      ],
    });

    if (!courses) {
      throw new NotFoundError();
    }

    for (let i = 0; i < courses.length; i += 1) {
      const course = courses[i];
      const nextTopicId = await topicsController.getLastTopicDoneAtCourse(course.id, userId);
      course.dataValues.nextTopicId = nextTopicId;
    }

    return courses;
  }
}

module.exports = new CoursesController();
