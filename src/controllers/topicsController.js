const Topic = require('../models/Topic');
const Theory = require('../models/Theory');
const Exercise = require('../models/Exercise');
const TheoryUser = require('../models/TheoryUser');
const User = require('../models/User');

class TopicController {
  getOne(topicId, userId) {
    return Topic.findByPk(topicId, {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        {
          model: Theory,
          attributes: [['id', 'theoryId'], 'youtubeUrl'],
          include: {
            model: User,
            attributes: [['id', 'userId']],
            through: {
              attributes: []
            }
          }
        },
        {
          model: Exercise,
          attributes: [['id', 'exerciseId'], 'description'],
          include: {
            model: User,
            attributes: [['id', 'userId']],
            through: {
              attributes: []
            }
          }
        }
      ]
    });
  }
}

module.exports = new TopicController();