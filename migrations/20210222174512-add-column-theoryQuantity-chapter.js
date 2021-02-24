module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chapters', 'theoryQuantity', {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('chapters', 'theoryQuantity');
  },
};
