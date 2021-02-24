module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('exercises', 'description');
    await queryInterface.addColumn('exercises', 'enunciated', {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('exercises', 'enunciated');
    await queryInterface.addColumn('exercises', 'description', {
      type: Sequelize.STRING,
    });
  },
};
