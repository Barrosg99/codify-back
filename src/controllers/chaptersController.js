const { Chapter } = require('../models');
const { NotFoundError } = require('../errors');

class ChaptersController {
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

    return Chapter.findAndCountAll(options);
  }

  getOne(id) {
    return Chapter.findByPk(id);
  }

  async editChapter(updatedChapter) {
    const chapter = await this.getOne(updatedChapter.id);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const {
      courseId, name, order,
    } = updatedChapter;

    chapter.courseId = courseId;
    chapter.name = name;
    chapter.order = order;

    await chapter.save();

    return chapter;
  }

  createChapter({
    courseId, name, order,
  }) {
    return Chapter.create({
      courseId, name, order,
    });
  }

  deleteChapter(id) {
    return Chapter.update({ excluded: true }, {
      where: { id },
      returning: true,
      raw: true,
    });
  }

  async changeTopicsQuantity(id, operation) {
    const chapter = await this.getOne(id);

    if (operation === 'plus') {
      chapter.topicsQuantity += 1;
    } else if (operation === 'minus') {
      chapter.topicsQuantity -= 1;
    }
    await chapter.save();
  }

  async changeExerciseQuantity(id, operation) {
    const chapter = await this.getOne(id);

    if (operation === 'plus') {
      chapter.exercisesQuantity += 1;
    } else if (operation === 'minus') {
      chapter.exercisesQuantity -= 1;
    }
    await chapter.save();
  }
}

module.exports = new ChaptersController();
