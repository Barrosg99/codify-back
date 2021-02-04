const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

class AdminSession extends Sequelize.Model { }

AdminSession.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'adminSession',
  },
);

module.exports = AdminSession;
