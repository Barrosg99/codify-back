/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const Exercise = require('../models/Exercise');
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
    exercise.topicId = topicId;
    exercise.description = description;

    await exercise.save();

    return exercise;
  }

  async creteExercise({ topicId, description }) {
    const topic = await topicsController.getOne(topicId);
    console.log(topic.dataValues);
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
