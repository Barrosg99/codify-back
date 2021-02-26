module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exercises', 'initialCode', {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('exercises', 'initialCode');
  },
};
