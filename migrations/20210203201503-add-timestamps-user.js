/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users',
      'createdAt',
      {
        type: Sequelize.DATE,
      });
    await queryInterface.addColumn('users',
      'updatedAt',
      {
        type: Sequelize.DATE,
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'createdAt');
    await queryInterface.removeColumn('users', 'updatedAt');
  },
};
