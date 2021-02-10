/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('chapters', [{
      id: 1000,
      courseId: 1000,
      name: 'Apresentação',
      order: 1,
      topicsQuantity: 4,
      exercisesQuantity: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('chapters', null, {});
  },
};
