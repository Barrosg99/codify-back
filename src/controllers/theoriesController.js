const { NotFoundError } = require('../errors');
const {
  Theory, User, Topic, Chapter, TheoryUser, CourseUser,
} = require('../models');
const chaptersController = require('./chaptersController');
const topicsController = require('./topicsController');

class TheoriesController {
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

    return Theory.findAndCountAll(options);
  }

  getOne(id) {
    return Theory.findByPk(id);
  }

  async editTheory({
    id, topicId, youtubeUrl,
  }) {
    const theory = await this.getOne(id);

    theory.topicId = topicId;
    theory.youtubeUrl = youtubeUrl;

    await theory.save();

    return theory;
  }

  async createTheory({ topicId, youtubeUrl }) {
    const topic = await topicsController.getOne(topicId);

    await chaptersController.changeTheoryQuantity(topic.chapterId, 'plus');
    return Theory.create({
      topicId, youtubeUrl,
    });
  }

  async deleteTheory(id) {
    const theory = await this.getOne(id);

    const topic = await topicsController.getOne(theory.topicId);

    await chaptersController.changeTheoryQuantity(topic.chapterId, 'minus');

    return Theory.update({ excluded: true }, {
      where: { id },
      returning: true,
      raw: true,
    });
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
}
module.exports = new TheoriesController();
