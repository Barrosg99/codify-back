/* eslint-disable no-undef */
require('dotenv').config();

const theoriesController = require('../../src/controllers/theoriesController');
const {
  User, CourseUser, Topic, Theory, TheoryUser,
} = require('../../src/models');
const { NotFoundError } = require('../../src/errors');

jest.mock('../../src/models/User');
jest.mock('../../src/models/CourseUser');
jest.mock('../../src/models/Theory');
jest.mock('../../src/models/Topic');
jest.mock('../../src/models/TheoryUser');

jest.mock('jsonwebtoken', () => ({
  sign: () => 'token',
}));

jest.mock('bcrypt', () => ({
  compareSync: (password, hashPassword) => password === hashPassword,
  hashSync: () => 'password',
}));

describe('Testing function postTheoryProgress', () => {
  it('should return false if user has already done the theory', async () => {
    const userId = 1;
    const theoryId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    TheoryUser.findOne.mockImplementationOnce(() => ({ destroy: () => true }));
    CourseUser.decrement.mockImplementationOnce(() => 0);

    const response = await theoriesController.postTheoryProgress(userId, theoryId);

    expect(TheoryUser.findOne).toHaveBeenCalledWith({ where: { userId, theoryId } });
    expect(CourseUser.decrement).toHaveBeenCalled();
    expect(CourseUser.decrement).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(false);
  });

  it('should return true if user has not done the theory yet', async () => {
    const userId = 1;
    const theoryId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    TheoryUser.findOne.mockImplementationOnce(() => false);
    TheoryUser.create.mockImplementationOnce(() => true);
    CourseUser.increment.mockImplementationOnce(() => 1);

    const response = await theoriesController.postTheoryProgress(userId, theoryId);

    expect(TheoryUser.findOne).toHaveBeenCalledWith({ where: { userId, theoryId } });
    expect(TheoryUser.create).toHaveBeenCalled();
    expect(TheoryUser.create).toHaveBeenCalledWith({ userId, theoryId });
    expect(CourseUser.increment).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(true);
  });

  it('should throw NotFoundError if sent userId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => false);
    Theory.findByPk.mockImplementationOnce(() => true);

    const testedFunction = theoriesController.postTheoryProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent theoryId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => false);

    const testedFunction = theoriesController.postTheoryProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});
