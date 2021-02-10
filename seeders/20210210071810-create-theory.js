/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('theories', [{
      id: 1000,
      topicId: 1000,
      youtubeUrl: 'https://www.youtube.com/watch?v=_6orTZEI_Xk',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('theories', null, {});
  },
};
