const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class Course extends Sequelize.Model {}

Course.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'course',
  },
);

module.exports = Course;
