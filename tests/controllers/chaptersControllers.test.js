/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable no-undef */
require('dotenv').config();

const chaptersController = require('../../src/controllers/chaptersController');
const Chapter = require('../../src/models/Chapter');

jest.mock('../../src/models/Chapter');

describe('getAll -> test pagination and filter by ids', () => {
  it('should call with pagination params', async () => {
    Chapter.findAndCountAll.mockImplementation((options) => options);

    const _end = 10;
    const _start = 0;
    const _order = 'ASC';
    const _sort = 'id';

    chaptersController.getAll({
      _end,
      _start,
      _order,
      _sort,
    });
    const options = {
      limit: _end - _start,
      offset: _start,
      order: [[_sort, _order]],
    };
    expect(Chapter.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining(options));
  });

  it('should call with ids params', async () => {
    const id = [1, 2, 3, 4, 5];
    chaptersController.getAll({
      id,
    });

    const options = { id };

    expect(Chapter.findAndCountAll)
      .toHaveBeenCalledWith(
        { where: expect.objectContaining(options) },
      );
  });
});
