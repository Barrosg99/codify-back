/* eslint-disable no-undef */
require('dotenv').config();

const exercisesController = require('../../src/controllers/exercisesController');
const {
  User, CourseUser, Topic, Exercise, ExerciseUser,
} = require('../../src/models');
const { NotFoundError } = require('../../src/errors');

jest.mock('../../src/models/CourseUser');
jest.mock('../../src/models/Topic');
jest.mock('../../src/models/ExerciseUser');
jest.mock('../../src/models/Exercise');
jest.mock('../../src/models/User');

jest.mock('jsonwebtoken', () => ({
  sign: () => 'token',
}));

jest.mock('bcrypt', () => ({
  compareSync: (password, hashPassword) => password === hashPassword,
  hashSync: () => 'password',
}));

describe('Testing function postExerciseProgress', () => {
  it('should return false if user has already done the exercise', async () => {
    const userId = 1;
    const exerciseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    ExerciseUser.findOne.mockImplementationOnce(() => ({ destroy: () => true }));
    CourseUser.decrement.mockImplementationOnce(() => 0);

    const response = await exercisesController.postExerciseProgress(userId, exerciseId);

    expect(ExerciseUser.findOne).toHaveBeenCalledWith({ where: { userId, exerciseId } });
    expect(CourseUser.decrement).toHaveBeenCalled();
    expect(CourseUser.decrement).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(false);
  });

  it('should return true if user has not done the theory yet', async () => {
    const userId = 1;
    const exerciseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    ExerciseUser.findOne.mockImplementationOnce(() => false);
    ExerciseUser.create.mockImplementationOnce(() => true);
    CourseUser.increment.mockImplementationOnce(() => 1);

    const response = await exercisesController.postExerciseProgress(userId, exerciseId);

    expect(ExerciseUser.findOne).toHaveBeenCalledWith({ where: { userId, exerciseId } });
    expect(ExerciseUser.create).toHaveBeenCalled();
    expect(ExerciseUser.create).toHaveBeenCalledWith({ userId, exerciseId });
    expect(CourseUser.increment).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(true);
  });

  it('should throw NotFoundError if sent userId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => false);
    Exercise.findByPk.mockImplementationOnce(() => true);

    const testedFunction = exercisesController.postExerciseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent theoryId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => false);

    const testedFunction = exercisesController.postExerciseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});
