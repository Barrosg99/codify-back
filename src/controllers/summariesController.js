/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const { Op } = require('sequelize');
const Chapter = require('../models/Chapter');
const Topic = require('../models/Topic');
const NotFoundError = require('../errors/NotFoundError');

class SummariesController {
  async getAll({
    _end, _start, _order, _sort,
  }) {
    const options = {
      limit: _end,
      offset: _start,
      order: [[_sort, _order]],
      where: { excluded: false },
      include: {
        model: Topic,
        where: { excluded: false },
        required: false,
        attributes: { exclude: ['chapterId'] },
      },
    };
    const chapter = await Chapter.findAndCountAll(options);
    return chapter;
  }

  getOne(id) {
    return Chapter.findByPk(id, {
      where: { excluded: false },
      include: {
        model: Topic,
        where: { excluded: false },
        attributes: { exclude: ['chapterId'] },
      },
    });
  }

  async editSummary(updatedSummary) {
    const summary = await this.getOne(updatedSummary.id);
    if (!summary) throw new NotFoundError('Summary not found');

    const {
      courseId, name, order, topicsQuantity, exercisesQuantity, topics,
    } = updatedSummary;

    summary.courseId = courseId;
    summary.name = name;
    summary.order = order;
    summary.topicsQuantity = topicsQuantity;
    summary.exercisesQuantity = exercisesQuantity;

    const newTopics = await this.updateTopics(topics, summary);
    if (newTopics !== undefined) {
      newTopics.forEach((topic) => delete topic.dataValues.chapterId);
    }

    await summary.save();
    summary.topics = [...summary.topics, ...newTopics];
    return summary;
  }

  async updateTopics(topics, chapter) {
    const ids = [];
    const updateTopics = [];
    topics.forEach((updatedTopic) => {
      const foundTopic = chapter.topics.find((topic) => updatedTopic.id === topic.id);
      if (foundTopic) {
        ids.push(foundTopic.id);
        updateTopics.push(foundTopic);
      }
    });

    await Topic.update({ excluded: true }, {
      where: { id: { [Op.notIn]: ids }, chapterId: chapter.id },
    });

    await Promise.all(
      updateTopics
        .map(async (oldTopic) => topics.map(async ({ name, order, id }) => {
          if (oldTopic.id === id) {
            oldTopic.name = name;
            oldTopic.order = order;
            return oldTopic.save();
          }
        })),
    );

    const newTopics = [];
    topics.forEach((topic) => {
      if (topic.id === null) {
        newTopics.push({ name: topic.name, order: topic.order, chapterId: chapter.id });
      }
    });
    return Topic.bulkCreate(newTopics, {
      returning: true,
      raw: true,
    });
  }

  async createSummary({
    courseId, name, order, topicsQuantity, exercisesQuantity, topics,
  }) {
    const newChapter = await Chapter.create({
      courseId, name, order, topicsQuantity, exercisesQuantity,
    });
    await Promise.all(
      topics
        .map(async (topic) => newChapter.createTopic({ name: topic.name, order: topic.order })),
    );
    return newChapter;
  }

  async deleteSummary(id) {
    const deleteChapter = await Chapter.update({ excluded: true }, {
      where: { id },
      returning: true,
      raw: true,
    });
    return deleteChapter;
  }
}

module.exports = new SummariesController();
