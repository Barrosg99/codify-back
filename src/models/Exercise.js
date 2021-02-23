const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class Exercise extends Sequelize.Model { }

Exercise.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    topicId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'topics',
        key: 'id',
      },
    },
    enunciated: {
      type: Sequelize.STRING,
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
    modelName: 'exercise',
  },
);

module.exports = Exercise;
