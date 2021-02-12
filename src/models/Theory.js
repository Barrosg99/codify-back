const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class Theory extends Sequelize.Model { }

Theory.init(
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
    youtubeUrl: {
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
    modelName: 'theory',
  },
);

module.exports = Theory;
