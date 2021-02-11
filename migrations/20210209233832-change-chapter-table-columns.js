module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('chapters', 'topicsQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.changeColumn('chapters', 'exercisesQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('chapters', 'topicsQuantity', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn('chapters', 'exercisesQuantity', {
      type: Sequelize.INTEGER,
    });
  },
};
