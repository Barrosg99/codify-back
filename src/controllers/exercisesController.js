const { Exercise } = require('../models');
const chaptersController = require('./chaptersController');
const topicsController = require('./topicsController');

class ExercisesController {
  getAll({
    _end, _start, _order, _sort,
  }) {
    const options = {
      limit: _end,
      offset: _start,
      order: [[_sort, _order]],
      where: { excluded: false },
    };

    return Exercise.findAndCountAll(options);
  }

  getOne(id) {
    return Exercise.findByPk(id);
  }

  async editExercise({ id, topicId, description }) {
    const exercise = await this.getOne(id);

    if (exercise.topicId !== topicId) {
      const oldTopic = await topicsController.getOne(exercise.topicId);
      const newTopic = await topicsController.getOne(topicId);
      if (oldTopic.chapterId !== newTopic.chapterId) {
        await chaptersController.changeExerciseQuantity(oldTopic.chapterId, 'minus');
        await chaptersController.changeExerciseQuantity(newTopic.chapterId, 'plus');
      }
    }

    exercise.topicId = topicId;
    exercise.description = description;

    await exercise.save();

    return exercise;
  }

  async creteExercise({ topicId, description }) {
    const topic = await topicsController.getOne(topicId);

    await chaptersController.changeExerciseQuantity(topic.chapterId, 'plus');

    return Exercise.create({ topicId, description });
  }

  async deleteExercise(id) {
    const exercise = await this.getOne(id);

    const topic = await topicsController.getOne(exercise.topicId);

    await chaptersController.changeExerciseQuantity(topic.chapterId, 'minus');

    exercise.excluded = true;
    await exercise.save();
    return exercise;
  }
}

module.exports = new ExercisesController();
