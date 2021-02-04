module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('courses',
      'createdAt',
      {
        type: Sequelize.DATE,
      });
    await queryInterface.addColumn('courses',
      'updatedAt',
      {
        type: Sequelize.DATE,
      });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('courses', 'createdAt');
    await queryInterface.removeColumn('courses', 'updatedAt');
  },
};
