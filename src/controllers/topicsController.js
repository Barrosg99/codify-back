/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const NotFoundError = require('../errors/NotFoundError');
const Topic = require('../models/Topic');
const chaptersController = require('./chaptersController');

class TopicsController {
  getAll({
    _end, _start, _order, _sort, id,
  }) {
    let options = {
      limit: _end - _start,
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

  async editTopic({
    id, chapterId, name, order,
  }) {
    const topic = await this.getOne(id);
    if (!topic) throw new NotFoundError('Topic not found');

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
