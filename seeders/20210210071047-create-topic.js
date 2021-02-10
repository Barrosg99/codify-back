/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('topics', [{
      id: 1000,
      chapterId: 1000,
      name: 'Como usar',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('topics', null, {});
  },
};
