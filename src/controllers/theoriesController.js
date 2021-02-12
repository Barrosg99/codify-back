/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const Theory = require('../models/Theory');

class TheoriesController {
  getAll({
    _end, _start, _order, _sort,
  }) {
    const options = {
      limit: _end,
      offset: _start,
      order: [[_sort, _order]],
    };

    return Theory.findAndCountAll(options);
  }

  getOne(id) {
    return Theory.findByPk(id);
  }

  async editTheory(updatedTheory) {
    console.log(updatedTheory);
  }
}
module.exports = new TheoriesController();
