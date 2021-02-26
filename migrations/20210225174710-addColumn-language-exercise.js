module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exercises', 'language', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('exercises', 'language');
  },
};
