const Topic = require('../models/Topic');
const Theory = require('../models/Theory');
const Exercise = require('../models/Exercise');
const TheoryUser = require('../models/TheoryUser');
const User = require('../models/User');

class TopicController {
  async getOne(topicId, userId) {
    const topic = await Topic.findByPk(topicId, {
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
              where: { userId },
              attributes: [],
              required: false,
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
              where: { userId },
              attributes: [],
              required: false
            }
          }
        }
      ]
    });

    topic.theories.forEach(t => {
      if (t.users.length > 0) t.dataValues.userHasFinished = true;
      else t.dataValues.userHasFinished = false;

      delete t.dataValues.users;
    });

    topic.exercises.forEach(e => {
      if (e.users.length > 0) e.dataValues.userHasFinished = true;
      else e.dataValues.userHasFinished = false;

      delete e.dataValues.users;
    });

    return topic;
  }
}

module.exports = new TopicController();