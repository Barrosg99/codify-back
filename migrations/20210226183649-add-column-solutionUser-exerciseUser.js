module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exerciseUsers', 'solutionUser', {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('exerciseUsers', 'solutionUser');
  },
};
