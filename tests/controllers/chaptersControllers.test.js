/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
/* eslint-disable no-undef */
require('dotenv').config();

const chaptersController = require('../../src/controllers/chaptersController');
const Chapter = require('../../src/models/Chapter');
const NotFoundError = require('../../src/errors/NotFoundError');

jest.mock('../../src/models/Chapter');

describe('getAll -> test pagination and filter by ids', () => {
  Chapter.findAndCountAll.mockImplementation((options) => options);

  it('should call with pagination params', async () => {
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

describe('Function editChapter', () => {
  it('should throw NotFoundError if invalid id is sent', async () => {
    const id = 1;
    const courseId = 1;
    const name = 'Teste';
    const order = 1;

    const spyFn = jest.spyOn(chaptersController, 'getOne');
    chaptersController.getOne.mockResolvedValueOnce(null);

    const testFn = chaptersController.editChapter({
      id, courseId, name, order,
    });

    spyFn.mockRestore();

    expect(testFn).rejects.toThrow(NotFoundError);
  });
});

describe('Function changeTopicsQuantity', () => {
  it('should add 1 to topics quantity', async () => {
    const chapter = {
      topicsQuantity: 0,
      save: () => true,
    };

    const spyFn = jest.spyOn(chaptersController, 'getOne');
    chaptersController.getOne.mockResolvedValueOnce(chapter);

    await chaptersController.changeTopicsQuantity(1, 'plus');

    expect(spyFn).toHaveBeenCalledWith(1);
    expect(chapter.topicsQuantity).toBe(1);

    spyFn.mockRestore();
  });

  it('should deduct 1 to topics quantity', async () => {
    const chapter = {
      topicsQuantity: 1,
      save: () => true,
    };

    const spyFn = jest.spyOn(chaptersController, 'getOne');
    chaptersController.getOne.mockResolvedValueOnce(chapter);

    await chaptersController.changeTopicsQuantity(1, 'minus');

    expect(spyFn).toHaveBeenCalledWith(1);
    expect(chapter.topicsQuantity).toBe(0);

    spyFn.mockRestore();
  });
});

describe('Function changeExercisesQuantity', () => {
  it('should add 1 to exercise quantity', async () => {
    const chapter = {
      exercisesQuantity: 0,
      save: () => true,
    };

    const spyFn = jest.spyOn(chaptersController, 'getOne');
    chaptersController.getOne.mockResolvedValueOnce(chapter);

    await chaptersController.changeExerciseQuantity(1, 'plus');

    expect(spyFn).toHaveBeenCalledWith(1);
    expect(chapter.exercisesQuantity).toBe(1);

    spyFn.mockRestore();
  });

  it('should deduct 1 to topics quantity', async () => {
    const chapter = {
      exercisesQuantity: 1,
      save: () => true,
    };

    const spyFn = jest.spyOn(chaptersController, 'getOne');
    chaptersController.getOne.mockResolvedValueOnce(chapter);

    await chaptersController.changeExerciseQuantity(1, 'minus');

    expect(spyFn).toHaveBeenCalledWith(1);
    expect(chapter.exercisesQuantity).toBe(0);

    spyFn.mockRestore();
  });
});
