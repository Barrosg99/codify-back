const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class Chapter extends Sequelize.Model { }

Chapter.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    topicsQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    exercisesQuantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'chapter',
  },
);

module.exports = Chapter;
