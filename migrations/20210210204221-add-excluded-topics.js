/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('topics', 'excluded', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('topics', 'excluded');
  },
};
