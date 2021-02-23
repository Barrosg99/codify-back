module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameColumn('exercises', 'description', 'enunciated');
  },

  down: async (queryInterface) => {
    await queryInterface.renameColumn('exercises', 'enunciated', 'description');
  },
};
