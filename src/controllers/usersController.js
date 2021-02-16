/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {
  TopicUser,
  AdminSession,
  ExerciseUser,
  Exercise,
  Theory,
  TheoryUser,
  Topic,
  CourseUser,
  Chapter,
  Course,
  Session,
  User,
} = require('../models');

const {
  NotFoundError,
  WrongPasswordError,
  AuthError,
} = require('../errors');

class UsersController {
  async create({
    name, password, email, avatarUrl,
  }) {
    avatarUrl = !avatarUrl ? null : avatarUrl;
    password = bcrypt.hashSync(password, 10);
    const user = await User.create({
      name, email, password, avatarUrl,
    }, { returning: true, raw: true });
    delete user.dataValues.password;
    return user;
  }

  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async createSession(email, password) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const passwordComparison = bcrypt.compareSync(password, user.password);
    if (!passwordComparison) {
      throw new WrongPasswordError('Password is incorrect');
    }

    const session = await Session.create({ userId: user.id });
    const token = jwt.sign({ id: session.id }, process.env.SECRET);

    return {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      token,
      hasInitAnyCourse: user.hasInitAnyCourse,
    };
  }

  findSessionById(id) {
    return Session.findByPk(id);
  }

  async getCourseProgress(userId, courseId) {
    let userProgress; let
      hasStarted = false;

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);
    if (!user) throw new NotFoundError('User not found');
    if (!course) throw new NotFoundError('Course not found');

    const userCourseData = await CourseUser.findOne({ where: { userId, courseId } });
    if (!userCourseData) userProgress = 0;
    else {
      const totalTopics = await Chapter.sum('topicsQuantity', { where: { courseId } });

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

  async postTheoryProgress(userId, theoryId) {
    const user = await User.findByPk(userId);
    const theory = await Theory.findByPk(theoryId);
    if (!user) throw new NotFoundError('User not found');
    if (!theory) throw new NotFoundError('Theory not found');

    const topic = await Topic.findByPk(theory.topicId, {
      include: {
        model: Chapter,
      },
    });

    const { courseId } = topic.chapter;

    const association = await TheoryUser.findOne({ where: { userId, theoryId } });

    if (association) {
      await association.destroy();
      await CourseUser.decrement('doneActivities', { where: { userId, courseId } });
      return false;
    }

    await TheoryUser.create({ userId, theoryId });
    await CourseUser.increment('doneActivities', { where: { userId, courseId } });
    return true;
  }

  async postExerciseProgress(userId, exerciseId) {
    const user = await User.findByPk(userId);
    const exercise = await Exercise.findByPk(exerciseId);
    if (!user) throw new NotFoundError('User not found');
    if (!exercise) throw new NotFoundError('Exercise not found');

    const topic = await Topic.findByPk(exercise.topicId, {
      include: {
        model: Chapter,
      },
    });

    const { courseId } = topic.chapter;

    const association = await ExerciseUser.findOne({ where: { userId, exerciseId } });

    if (association) {
      await association.destroy();
      await CourseUser.decrement('doneActivities', { where: { userId, courseId } });
      return false;
    }

    await ExerciseUser.create({ userId, exerciseId });
    await CourseUser.increment('doneActivities', { where: { userId, courseId } });
    return true;
  }

  async postAdminSignIn(username, password) {
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      throw new AuthError('Wrong username or password');
    }

    const session = await AdminSession.create({ userId: process.env.ADMIN_ID });
    const token = jwt.sign({ id: session.id }, process.env.SECRET);
    return token;
  }

  async postAdminSignOut(id) {
    return AdminSession.destroy({ where: { id } });
  }

  findAdminSessionById(id) {
    return AdminSession.findByPk(id);
  }

  async getOngoingCoursesByUser(id) {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    return Course.findAll({
      include: {
        model: User,
        through: {
          model: CourseUser,
          where: {
            userId: id,
          },
          order: [
            ['updatedAt', 'DESC'],
          ],
        },
      },
    });
  }

  async postUserSignOut(id) {
    return Session.destroy({ where: { id } });
  }

  async postTopicProgress(userId, topicId) {
    const topic = await Topic.findByPk(topicId, {
      include: Chapter,
    });
    if (!topic) throw new NotFoundError();

    const completedTopic = await this._completedAllActivities(userId, topicId);

    if (completedTopic) {
      await TopicUser.findOrCreate({ where: { userId, topicId } });
    }

    const nextTopic = await this._getNextTopic(topic);
    return { nextTopic };
  }

  async _completedAllActivities(userId, topicId) {
    const quantityExercises = await Exercise.count({ where: { topicId } });
    const quantityTheory = await Theory.count({ where: { topicId } });

    const countTheoryDone = await Theory.count({
      where: { topicId },
      include: {
        model: TheoryUser,
        where: { userId },
      },
    });

    const countExerciseDone = await Exercise.count({
      where: { topicId },
      include: {
        model: ExerciseUser,
        where: { userId },
      },
    });

    if (countTheoryDone !== quantityTheory || countExerciseDone !== quantityExercises) {
      return false;
    }

    return true;
  }

  async _getNextTopic(topic) {
    let nextTopic = await Topic.findOne({
      attributes: ['id'],
      where: {
        chapterId: topic.chapterId,
        order: topic.order + 1,
      },
    });

    if (!nextTopic) {
      nextTopic = await Topic.findOne({
        where: { order: 1 },
        attributes: ['id'],
        include: {
          model: Chapter,
          attributes: [],
          where: {
            courseId: topic.chapter.courseId,
            order: topic.chapter.order + 1,
          },
        },
      });
    }

    return nextTopic.id;
  }
}

module.exports = new UsersController();
