const {
  Exercise, User, Chapter, ExerciseUser, CourseUser, Topic,
} = require('../models');
const chaptersController = require('./chaptersController');
const topicsController = require('./topicsController');

const { NotFoundError } = require('../errors');

class ExercisesController {
  getAll({
    _end, _start, _order, _sort,
  }) {
    const limit = _end ? _end - _start : null;
    const options = {
      limit,
      offset: _start,
      order: [[_sort, _order]],
      where: { excluded: false },
    };

    return Exercise.findAndCountAll(options);
  }

  getOne(id) {
    return Exercise.findByPk(id);
  }

  async editExercise({
    id, topicId, enunciated, initialCode,
  }) {
    const exercise = await this.getOne(id);
    if (!exercise) throw new NotFoundError('Exercise id is not valid');

    if (exercise.topicId !== topicId) {
      const oldTopic = await topicsController.getOne(exercise.topicId);
      const newTopic = await topicsController.getOne(topicId);
      if (oldTopic.chapterId !== newTopic.chapterId) {
        await chaptersController.changeExerciseQuantity(oldTopic.chapterId, 'minus');
        await chaptersController.changeExerciseQuantity(newTopic.chapterId, 'plus');
      }
    }

    exercise.topicId = topicId;
    exercise.enunciated = enunciated;
    exercise.initialCode = initialCode;

    await exercise.save();

    return exercise;
  }

  async createExercise({ topicId, enunciated, initialCode }) {
    const topic = await topicsController.getOne(topicId);

    await chaptersController.changeExerciseQuantity(topic.chapterId, 'plus');

    return Exercise.create({ topicId, enunciated, initialCode });
  }

  async deleteExercise(id) {
    const exercise = await this.getOne(id);

    const topic = await topicsController.getOne(exercise.topicId);

    await chaptersController.changeExerciseQuantity(topic.chapterId, 'minus');

    exercise.excluded = true;
    await exercise.save();
    return exercise;
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
}

module.exports = new ExercisesController();
