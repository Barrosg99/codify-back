/* eslint-disable global-require */
/* eslint-disable no-undef */
require('dotenv').config();

const chaptersController = require('../../src/controllers/chaptersController');
const Chapter = require('../../src/models/Chapter');

describe('getAll -> test pagination and filter by ids', () => {
  it('should call with pagination params', async () => {
    const spy = jest.spyOn(Chapter, 'findAndCountAll');
    Chapter.findAndCountAll.mockImplementationOnce((options) => options);
    chaptersController.getAll();
  });
});
