/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const course = await queryInterface.sequelize.query('SELECT id FROM courses WHERE title=\'JavaScript do zero ao avançado\' LIMIT 1');
    const chapter1 = await queryInterface.sequelize.query(`SELECT id FROM chapters WHERE "courseId"=${course[0][0].id} AND "order"=1`);

    const topic1 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=1`);

    const topic2 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=2`);

    const topic3 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=2`);

    const topic4 = await queryInterface.sequelize.query(`SELECT id FROM topics WHERE "chapterId"=${chapter1[0][0].id} AND "order"=2`);
    await queryInterface.bulkInsert('exercises', [
      {
        topicId: topic1[0][0].id,
        enunciated: `
          <h3>Exercício 1</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br><br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br>
          Exemplo:
          <br>
          Quando enviado ... retorna ...
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic1[0][0].id,
        enunciated: `
          <h3><strong>Exercício 2<strong></h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br><br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br>
          Exemplo:
          <br>
          Quando enviado ... retorna ...
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic2[0][0].id,
        enunciated: `
          <h3>Exercício 1</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br><br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br>
          Exemplo:
          <br>
          Quando enviado ... retorna ...
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic3[0][0].id,
        enunciated: `
          <h3>Exercício 1</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br><br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br>
          Exemplo:
          <br>
          Quando enviado ... retorna ...
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        topicId: topic4[0][0].id,
        enunciated: `
          <h3>Exercício 1</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br><br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Volutpat vitae in aenean quis quam praesent arcu, orci. Ipsum habitasse proin consectetur vel venenatis. Turpis libero aliquet cras vitae nunc commodo gravida. Sapien eget urna, ante mattis bibendum massa, feugiat.
          <br>
          Exemplo:
          <br>
          Quando enviado ... retorna ...
        `,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('exercises', null, {});
  },
};
