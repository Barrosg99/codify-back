const Topic = require('../models/Topic');
const Theory = require('../models/Theory');

class TopicController {
  getOne(id) {
    return Topic.findByPk(id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: {
        model: Theory,
        attributes: [['id', 'theoryId'], 'youtubeUrl']
      }
    });
  }
}

module.exports = new TopicController();