/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const course = await queryInterface.sequelize.query('SELECT id FROM courses WHERE title=\'JavaScript do zero ao avançado\'');
    const courseId = course[0][0].id;

    await queryInterface.bulkInsert('chapters', [
      {
        courseId,
        name: 'Apresentação',
        order: 1,
        topicsQuantity: 4,
        exercisesQuantity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId,
        name: 'Preparando o ambiente',
        order: 2,
        topicsQuantity: 2,
        exercisesQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId,
        name: 'Introdução a linguagem JS',
        order: 3,
        topicsQuantity: 2,
        exercisesQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId,
        name: 'Váriaveis e tipos de dados',
        order: 4,
        topicsQuantity: 2,
        exercisesQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId,
        name: 'Estruturas lógicas e condicionais',
        order: 5,
        topicsQuantity: 2,
        exercisesQuantity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('chapters', null, {});
  },
};
