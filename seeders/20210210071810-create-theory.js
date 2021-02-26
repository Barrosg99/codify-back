/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const course = await queryInterface.sequelize.query('SELECT id FROM courses WHERE title=\'JavaScript do zero ao avançado\' LIMIT 1');
    const chapter1 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${course[0][0].id} AND "order"=1`);

    const topic1 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=1`);

    const topic2 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=2`);

    const topic3 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=3`);

    const topic4 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=4`);

    await queryInterface.bulkInsert('theories', [
      {
        topicId: topic1[0][0].id,
        youtubeUrl: 'https://www.youtube.com/watch?v=Ptbk2af68e8&ab_channel=CursoemV%C3%ADdeo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic2[0][0].id,
        youtubeUrl: 'https://www.youtube.com/watch?v=Ptbk2af68e8&ab_channel=CursoemV%C3%ADdeo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic3[0][0].id,
        youtubeUrl: 'https://www.youtube.com/watch?v=Ptbk2af68e8&ab_channel=CursoemV%C3%ADdeo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic4[0][0].id,
        youtubeUrl: 'https://www.youtube.com/watch?v=Ptbk2af68e8&ab_channel=CursoemV%C3%ADdeo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('theories', null, {});
  },
};
