/* eslint-disable no-undef */
require('dotenv').config();

const topicsController = require('../../src/controllers/topicsController');
const {
  Topic, Chapter, Theory, Exercise, TopicUser,
} = require('../../src/models');
const { NotFoundError, NotNextTopicError } = require('../../src/errors');

jest.mock('../../src/models/Topic');
jest.mock('../../src/models/TopicUser');
jest.mock('../../src/models/Chapter');
jest.mock('../../src/models/Theory');
jest.mock('../../src/models/Exercise');

describe('function getOneWithUserProgress', () => {
  it('should return topic with its theories and exercises if valid topicId is sent', async () => {
    const topicId = 1; const
      userId = 1;

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

describe('funtion getLastTopicDoneAtCourse', () => {
  it('should return next topic id regarding which one is the last done by user', async () => {
    const courseId = 1;
    const userId = 1;
    Chapter.findAll.mockResolvedValueOnce([{
      topics: [{ id: 1 }],
    }]);

    const spyFn = jest.spyOn(topicsController, '_getNextTopic');
    const notToCallFn = jest.spyOn(topicsController, '_getFirstTopicAtFirstChapter');
    topicsController._getNextTopic.mockResolvedValueOnce(5);

    const response = await topicsController.getLastTopicDoneAtCourse(courseId, userId);

    expect(response).toBe(5);
    expect(spyFn).toHaveBeenCalledWith({
      id: 1,
    });
    expect(notToCallFn).not.toHaveBeenCalled();

    jest.clearAllMocks();
  });

  it('should return first topic id at first chapter when user dont finish any topic', async () => {
    const courseId = 1;
    const userId = 1;
    Chapter.findAll.mockResolvedValueOnce([]);

    const notToCallFn = jest.spyOn(topicsController, '_getNextTopic');
    const spyFn = jest.spyOn(topicsController, '_getFirstTopicAtFirstChapter');
    topicsController._getFirstTopicAtFirstChapter.mockResolvedValueOnce(5);

    const response = await topicsController.getLastTopicDoneAtCourse(courseId, userId);

    expect(response).toBe(5);
    expect(spyFn).toHaveBeenCalledWith(courseId);
    expect(notToCallFn).not.toHaveBeenCalled();

    jest.clearAllMocks();
  });
});

describe('function _getNextTopic', () => {
  it('should return a nextTopicId at same chapter when current topic is not the last one', async () => {
    const topic = { chapterId: 1, order: 2 };

    Topic.findOne.mockResolvedValueOnce({ id: 3 });

    const response = await topicsController._getNextTopic(topic);

    expect(Topic.findOne).toHaveBeenCalledTimes(1);
    expect(Topic.findOne).toHaveBeenCalledWith({
      attributes: ['id'],
      where: {
        chapterId: 1,
        order: 3,
      },
    });
    expect(response).toBe(3);
    jest.clearAllMocks();
  });

  it('should return a first topic at next chapter when current topic is the last one ', async () => {
    const topic = {
      chapterId: 1,
      order: 2,
      chapter: { courseId: 1, order: 1 },
    };

    Topic.findOne.mockResolvedValueOnce(null);
    Topic.findOne.mockResolvedValueOnce({ id: 3 });

    const response = await topicsController._getNextTopic(topic);

    expect(Topic.findOne).toHaveBeenCalledTimes(2);
    expect(Topic.findOne).toHaveBeenNthCalledWith(1, {
      attributes: ['id'],
      where: {
        chapterId: 1,
        order: 3,
      },
    });
    expect(Topic.findOne).toHaveBeenLastCalledWith({
      where: { order: 1 },
      attributes: ['id'],
      include: {
        model: Chapter,
        attributes: [],
        where: {
          courseId: 1,
          order: 2,
        },
      },
    });
    expect(response).toBe(3);
    jest.clearAllMocks();
  });
});

describe('function _completedAllActivities', () => {
  it('should return true when quantity activities done is equal at quantity total activities', async () => {
    const userId = 1;
    const topicId = 2;
    Exercise.count.mockResolvedValueOnce(5);
    Theory.count.mockResolvedValueOnce(3);
    Theory.count.mockResolvedValueOnce(3);
    Exercise.count.mockResolvedValueOnce(5);

    const response = await topicsController._completedAllActivities(userId, topicId);

    expect(Exercise.count).toHaveBeenCalledTimes(2);
    expect(Theory.count).toHaveBeenCalledTimes(2);
    expect(response).toBe(true);
    jest.clearAllMocks();
  });

  it('should return false when quantity activities done is not equal at quantity total activities', async () => {
    const userId = 1;
    const topicId = 2;
    Exercise.count.mockResolvedValueOnce(5);
    Theory.count.mockResolvedValueOnce(3);
    Theory.count.mockResolvedValueOnce(2);
    Exercise.count.mockResolvedValueOnce(4);

    const response = await topicsController._completedAllActivities(userId, topicId);

    expect(Exercise.count).toHaveBeenCalledTimes(2);
    expect(Theory.count).toHaveBeenCalledTimes(2);
    expect(response).toBe(false);
    jest.clearAllMocks();
  });

  it('should return false when user not finish all theories', async () => {
    const userId = 1;
    const topicId = 2;
    Exercise.count.mockResolvedValueOnce(5);
    Theory.count.mockResolvedValueOnce(3);
    Theory.count.mockResolvedValueOnce(2);
    Exercise.count.mockResolvedValueOnce(5);

    const response = await topicsController._completedAllActivities(userId, topicId);

    expect(Exercise.count).toHaveBeenCalledTimes(2);
    expect(Theory.count).toHaveBeenCalledTimes(2);
    expect(response).toBe(false);
    jest.clearAllMocks();
  });

  it('should return false when user not finish all exercises', async () => {
    const userId = 1;
    const topicId = 2;
    Exercise.count.mockResolvedValueOnce(5);
    Theory.count.mockResolvedValueOnce(3);
    Theory.count.mockResolvedValueOnce(3);
    Exercise.count.mockResolvedValueOnce(4);

    const response = await topicsController._completedAllActivities(userId, topicId);

    expect(Exercise.count).toHaveBeenCalledTimes(2);
    expect(Theory.count).toHaveBeenCalledTimes(2);
    expect(response).toBe(false);
    jest.clearAllMocks();
  });
});

describe('function postTopicProgress', () => {
  it('should return NotFoundError when topic not exists', async () => {
    Topic.findByPk.mockResolvedValueOnce(null);

    const testedFn = topicsController.postTopicProgress(1, 1);

    expect(testedFn).rejects.toThrow(NotFoundError);
    jest.clearAllMocks();
  });

  it('should call function findOrCreate topic exists and user have finish all activities', async () => {
    const userId = 1;
    const topicId = 1;

    jest.spyOn(topicsController, '_completedAllActivities');
    jest.spyOn(topicsController, '_getNextTopic');

    Topic.findByPk.mockResolvedValueOnce({ id: 1 });
    topicsController._completedAllActivities.mockResolvedValueOnce(true);
    topicsController._getNextTopic.mockResolvedValueOnce(5);

    const response = await topicsController.postTopicProgress(userId, topicId);

    expect(response).toMatchObject({ nextTopic: 5 });
    expect(topicsController._completedAllActivities).toHaveBeenCalledWith(userId, topicId);
    expect(topicsController._getNextTopic).toHaveBeenCalledWith({ id: 1 });
    expect(TopicUser.findOrCreate).toHaveBeenCalledWith({ where: { userId, topicId } });
    expect(TopicUser.findOne).not.toHaveBeenCalled();

    jest.clearAllMocks();
  });

  it('should toggle topic completion when user had finished before and he unchecks any activity', async () => {
    const userId = 1;
    const topicId = 1;

    jest.spyOn(topicsController, '_completedAllActivities');
    jest.spyOn(topicsController, '_getNextTopic');

    Topic.findByPk.mockResolvedValueOnce({ id: 1 });
    topicsController._completedAllActivities.mockResolvedValueOnce(false);
    topicsController._getNextTopic.mockResolvedValueOnce(5);
    TopicUser.findOne.mockResolvedValueOnce(null);

    const response = await topicsController.postTopicProgress(userId, topicId);

    expect(response).toMatchObject({ nextTopic: 5 });
    expect(topicsController._completedAllActivities).toHaveBeenCalledWith(userId, topicId);
    expect(topicsController._getNextTopic).toHaveBeenCalledWith({ id: 1 });
    expect(TopicUser.findOrCreate).not.toHaveBeenCalled();
    expect(TopicUser.findOne).toHaveBeenCalledWith({ where: { userId, topicId } });

    jest.clearAllMocks();
  });

  it('should toggle topic completion when user had finished before and he unchecks any activity with association destroy', async () => {
    const userId = 1;
    const topicId = 1;

    jest.spyOn(topicsController, '_completedAllActivities');
    jest.spyOn(topicsController, '_getNextTopic');

    const destroyFn = jest.fn();

    Topic.findByPk.mockResolvedValueOnce({ id: 1 });
    topicsController._completedAllActivities.mockResolvedValueOnce(false);
    topicsController._getNextTopic.mockResolvedValueOnce(5);
    TopicUser.findOne.mockResolvedValueOnce({ destroy: destroyFn });

    const response = await topicsController.postTopicProgress(userId, topicId);

    expect(response).toMatchObject({ nextTopic: 5 });
    expect(topicsController._completedAllActivities).toHaveBeenCalledWith(userId, topicId);
    expect(topicsController._getNextTopic).toHaveBeenCalledWith({ id: 1 });
    expect(TopicUser.findOrCreate).not.toHaveBeenCalled();
    expect(TopicUser.findOne).toHaveBeenCalledWith({ where: { userId, topicId } });
    expect(destroyFn).toHaveBeenCalled();

    jest.clearAllMocks();
  });

  it("should return NotNextTopicError when user is in the last chapter's last topic", async () => {
    const userId = 1;
    const topicId = 1;

    jest.spyOn(topicsController, '_completedAllActivities');
    jest.spyOn(topicsController, '_getNextTopic');

    const destroyFn = jest.fn();

    Topic.findByPk.mockResolvedValueOnce({ id: 1 });
    topicsController._completedAllActivities.mockResolvedValueOnce(false);
    TopicUser.findOne.mockResolvedValueOnce({ destroy: destroyFn });
    topicsController._getNextTopic.mockResolvedValueOnce(null);

    const testedFn = topicsController.postTopicProgress(userId, topicId);

    expect(testedFn).rejects.toThrow(NotNextTopicError);

    jest.clearAllMocks();
  });
});
