const Topic = require('../models/Topic');
const Theory = require('../models/Theory');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');

class TopicController {
  async getOneWithUserProgress(topicId, userId) {
    const topic = await Topic.findByPk(topicId, {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      order: [[{ model: Exercise }, 'id', 'ASC']],
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

    if (!topic) throw new NotFoundError('Topic not found');

    topic.theories.forEach(t => {
      if (t.dataValues.users.length > 0) t.dataValues.userHasFinished = true;
      else t.dataValues.userHasFinished = false;

      delete t.dataValues.users;
    });

    topic.exercises.forEach(e => {
      if (e.dataValues.users.length > 0) e.dataValues.userHasFinished = true;
      else e.dataValues.userHasFinished = false;

      delete e.dataValues.users;
    });

    return topic;
  }
}

module.exports = new TopicController();