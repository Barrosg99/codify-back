/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const course = await queryInterface.sequelize.query('SELECT id FROM courses WHERE title=\'JavaScript do zero ao avançado\' LIMIT 1');
    const courseId = course[0][0].id;

    const chapter1 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${courseId} AND "order"=1`);
    const chapter1Id = chapter1[0][0].id;

    const chapter2 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${courseId} AND "order"=2`);
    const chapter2Id = chapter2[0][0].id;

    const chapter3 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${courseId} AND "order"=3`);
    const chapter3Id = chapter3[0][0].id;

    const chapter4 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${courseId} AND "order"=4`);
    const chapter4Id = chapter4[0][0].id;

    const chapter5 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${courseId} AND "order"=5`);
    const chapter5Id = chapter5[0][0].id;

    await queryInterface.bulkInsert('topics', [
      {
        chapterId: chapter1Id,
        name: 'Como usar',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter1Id,
        name: 'Entrando na plataforma',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter1Id,
        name: 'Fazendo teorias',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter1Id,
        name: 'Fazendo exercícios',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter2Id,
        name: 'Como usar',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter2Id,
        name: 'Entrando na plataforma',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter3Id,
        name: 'Como usar',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter3Id,
        name: 'Entrando na plataforma',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter4Id,
        name: 'Como usar',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter4Id,
        name: 'Entrando na plataforma',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter5Id,
        name: 'Como usar',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        chapterId: chapter5Id,
        name: 'Entrando na plataforma',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('topics', null, {});
  },
};
