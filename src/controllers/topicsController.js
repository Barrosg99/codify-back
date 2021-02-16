/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const Topic = require('../models/Topic');
const Theory = require('../models/Theory');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const chaptersController = require('./chaptersController');

class TopicsController {
  getAll({
    _end, _start, _order, _sort, id,
  }) {
    const limit = _end ? _end - _start : null;
    let options = {
      limit,
      offset: _start,
      order: [[_sort, _order]],
      where: { excluded: false },
    };

    if (id) options = { where: { excluded: false, id } };

    return Topic.findAndCountAll(options);
  }

  getOne(id) {
    return Topic.findByPk(id);
  }

  async getOneWithUserProgress(topicId, userId) {
    const topic = await Topic.findByPk(topicId, {
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      order: [[{ model: Exercise }, 'id', 'ASC']],
      include: [
        {
          model: Theory,
          attributes: [['id', 'theoryId'], 'youtubeUrl'],
          include: {
            model: User,
            attributes: [['id', 'userId']],
            through: {
              where: { userId },
              attributes: [],
              required: false,
            },
          },
        },
        {
          model: Exercise,
          attributes: [['id', 'exerciseId'], 'description'],
          include: {
            model: User,
            attributes: [['id', 'userId']],
            through: {
              where: { userId },
              attributes: [],
              required: false,
            },
          },
        },
      ],
    });

    if (!topic) throw new NotFoundError('Topic not found');

    topic.theories.forEach((t) => {
      if (t.dataValues.users.length > 0) t.dataValues.userHasFinished = true;
      else t.dataValues.userHasFinished = false;

      delete t.dataValues.users;
    });

    topic.exercises.forEach((e) => {
      if (e.dataValues.users.length > 0) e.dataValues.userHasFinished = true;
      else e.dataValues.userHasFinished = false;

      delete e.dataValues.users;
    });

    return topic;
  }

  async editTopic({
    id, chapterId, name, order,
  }) {
    const topic = await this.getOne(id);
    if (!topic) throw new NotFoundError('Topic not found');

    if (topic.chapterId !== chapterId) {
      await chaptersController.changeTopicsQuantity(topic.chapterId, 'minus');
      await chaptersController.changeTopicsQuantity(chapterId, 'plus');
    }

    topic.chapterId = chapterId;
    topic.name = name;
    topic.order = order;

    await topic.save();

    return topic;
  }

  async createTopic({ chapterId, name, order }) {
    await chaptersController.changeTopicsQuantity(chapterId, 'plus');

    return Topic.create({
      chapterId, name, order,
    });
  }

  async deleteTopic(id) {
    const topic = await this.getOne(id);

    await chaptersController.changeTopicsQuantity(topic.chapterId, 'minus');

    topic.excluded = true;
    await topic.save();

    return topic;
  }
}

module.exports = new TopicsController();
