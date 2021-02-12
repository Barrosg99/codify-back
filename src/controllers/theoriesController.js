/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const Theory = require('../models/Theory');

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

  createTheory({ topicId, youtubeUrl }) {
    return Theory.create({
      topicId, youtubeUrl,
    });
  }

  async deleteTheory(id) {
    return Theory.update({ excluded: true }, {
      where: { id },
      returning: true,
      raw: true,
    });
  }
}
module.exports = new TheoriesController();
