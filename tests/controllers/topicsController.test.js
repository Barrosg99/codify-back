/* eslint-disable no-undef */
require('dotenv').config();

const topicsController = require('../../src/controllers/topicsController');
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
    const topicId = 1; const
      userId = 1;

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
