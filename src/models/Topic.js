const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class Topic extends Sequelize.Model { }

Topic.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    chapterId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'chapters',
        key: 'id',
      },
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    excluded: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'topic',
  },
);

module.exports = Topic;
