const Topic = require('../models/Topic');
const Theory = require('../models/Theory');
const Exercise = require('../models/Exercise');

class TopicController {
  getOne(topicId, userId) {
    return Topic.findByPk(topicId, {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        {
          model: Theory,
          attributes: [['id', 'theoryId'], 'youtubeUrl']
        },
        {
          model: Exercise,
          attributes: [['id', 'exerciseId'], 'description']
        }
      ]
    });
  }
}

module.exports = new TopicController();