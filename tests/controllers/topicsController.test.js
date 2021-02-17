/* eslint-disable no-undef */
require('dotenv').config();

const topicsController = require('../../src/controllers/topicsController');
const chaptersController = require('../../src/controllers/chaptersController');
const Topic = require('../../src/models/Topic');
const NotFoundError = require('../../src/errors/NotFoundError');

jest.mock('../../src/models/Topic');

describe('function getOneWithUserProgress', () => {
  it('should return topic with its theories and exercises if valid topicId is sent', async () => {
    const topicId = 1;
    const userId = 1;

    Topic.findByPk.mockImplementationOnce(() => (
      {
        name: 'Teste',
        theories: [
          {
            dataValues: {
              users: [],
            },
          },
        ],
        exercises: [
          {
            dataValues: {
              users: [],
            },
          },
        ],
      }
    ));

    const response = await topicsController.getOneWithUserProgress(topicId, userId);

    expect(response).toMatchObject({
      name: 'Teste',
      theories: [
        {
          dataValues: {
            userHasFinished: false,
          },
        },
      ],
      exercises: [
        {
          dataValues: {
            userHasFinished: false,
          },
        },
      ],
    });
  });

  it('should return user progress as true if he/she finished theory or activity', async () => {
    const topicId = 1;
    const userId = 1;

    Topic.findByPk.mockImplementationOnce(() => (
      {
        name: 'Teste',
        theories: [
          {
            dataValues: {
              users: [{ userId: 1 }],
            },
          },
        ],
        exercises: [
          {
            dataValues: {
              users: [{ userId: 1 }],
            },
          },
        ],
      }
    ));

    const response = await topicsController.getOneWithUserProgress(topicId, userId);

    expect(response).toMatchObject({
      name: 'Teste',
      theories: [
        {
          dataValues: {
            userHasFinished: true,
          },
        },
      ],
      exercises: [
        {
          dataValues: {
            userHasFinished: true,
          },
        },
      ],
    });
  });

  it('should throw NotFoundError if sent topic is invalid', async () => {
    const topicId = 1;
    const userId = 1;

    Topic.findByPk.mockImplementationOnce(() => false);

    const testedFunction = topicsController.getOneWithUserProgress(topicId, userId);

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});

describe('function editTopic', () => {
  it('should return updated topic data, changing topics quantity if sent chapter is different from the original one', async () => {
    const id = 1;
    const chapterId = 1;
    const name = 'Teste';
    const order = 1;

    jest.spyOn(topicsController, 'getOne');
    const spyFn = jest.spyOn(chaptersController, 'changeTopicsQuantity');
    topicsController.getOne.mockImplementationOnce(() => ({ chapterId: 2, save: () => true }));
    chaptersController.changeTopicsQuantity.mockImplementation(() => true);

    const response = await topicsController.editTopic({
      id, chapterId, name, order,
    });

    jest.restoreAllMocks();

    expect(spyFn).toHaveBeenCalledTimes(2);
    expect(spyFn).toHaveBeenNthCalledWith(1, 2, 'minus');
    expect(spyFn).toHaveBeenLastCalledWith(1, 'plus');
    expect(response).toMatchObject({
      chapterId,
      name,
      order,
      save: expect.any(Function),
    });
  });

  it('should return updated topic data, with no changes to topics quantity if sent chapter is the same than before', async () => {
    const id = 1;
    const chapterId = 1;
    const name = 'Teste';
    const order = 1;

    jest.spyOn(topicsController, 'getOne');
    const spyFn = jest.spyOn(chaptersController, 'changeTopicsQuantity');
    topicsController.getOne.mockResolvedValueOnce({ chapterId: 1, save: () => true });

    const response = await topicsController.editTopic({
      id, chapterId, name, order,
    });

    jest.restoreAllMocks();

    expect(spyFn).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      chapterId,
      name,
      order,
      save: expect.any(Function),
    });
  });

  it('should throw NotFoundError if invalid id is sent', async () => {
    const id = 1;
    const chapterId = 1;
    const name = 'Teste';
    const order = 1;

    const spyFn = jest.spyOn(topicsController, 'getOne');
    topicsController.getOne.mockResolvedValueOnce(null);

    const testFn = topicsController.editTopic({
      id, chapterId, name, order,
    });

    spyFn.mockRestore();

    expect(testFn).rejects.toThrow(NotFoundError);
  });
});
