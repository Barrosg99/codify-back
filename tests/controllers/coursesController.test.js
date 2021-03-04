/* eslint-disable global-require */
/* eslint-disable no-undef */
require('dotenv').config();

const coursesController = require('../../src/controllers/coursesController');
const topicsController = require('../../src/controllers/topicsController');
const ConflictError = require('../../src/errors/ConflictError');
const NotFoundError = require('../../src/errors/NotFoundError');
const {
  Course, CourseUser, Chapter, User,
} = require('../../src/models');

jest.mock('../../src/models/Course');
jest.mock('../../src/models/CourseUser');
jest.mock('../../src/models/Chapter');
jest.mock('../../src/models/User');

describe('function createCourse', () => {
  it('should return an throw error trying to create a course that already exists.', async () => {
    Course.findOne.mockResolvedValue({
      id: 1,
      title: 'JavaScript do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
      color: 'amarelo',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    });

    async function course() {
      return coursesController.createCourse(
        'JavaScript do zero ao avançado',
        'Curso para vc ficar voando mesmo tipo mostrão no JS',
        'amarelo',
        'https://i.imgur.com/lWUs38z.png',
      );
    }

    expect(await course).rejects.toThrow(ConflictError);
  });
});

describe('function editCourse', () => {
  it('should return an throw error trying to edit a course that not exists.', async () => {
    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return coursesController.editCourse(
        'Python é bom demais',
        'Curso para vc ficar voando mesmo tipo mostrão no PY',
        'azul',
        'https://i.imgur.com/lWUs38z.png',
      );
    }

    expect(await course).rejects.toThrow(NotFoundError);
  });
});

describe('function deleteCourse', () => {
  it('should return a throw error if the course does not exist.', async () => {
    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return coursesController.deleteCourse(2);
    }

    expect(await course).rejects.toThrow(NotFoundError);
  });
});

describe('function getOne - gets one course data', () => {
  it('should return course data if it exists in database', async () => {
    Course.findByPk.mockResolvedValueOnce({
      id: 1,
      title: 'JavaScript',
      description: 'JS course',
      color: '#FFFB0F',
      imageUrl: 'https://google.com',
      chapters: [
        {
          id: 1,
          name: 'Apresentação',
          topicsQuantity: 2,
          theoryQuantity: 0,
          exercisesQuantity: 5,
        },
      ],
    });

    const response = await coursesController.getOne(1);

    expect(response).toMatchObject({
      id: 1,
      title: 'JavaScript',
      description: 'JS course',
      color: '#FFFB0F',
      imageUrl: 'https://google.com',
      chapters: [
        {
          id: 1,
          name: 'Apresentação',
          topicsQuantity: 2,
          theoryQuantity: 0,
          exercisesQuantity: 5,
        },
      ],
    });
  });

  it('should throw NotFoundError if required course is not on database', async () => {
    Course.findByPk.mockImplementation(() => null);

    const response = coursesController.getOne(1);

    expect(response).rejects.toThrow(NotFoundError);
  });
});

describe('Testing function getCourseProgress of courseController', () => {
  it('should return user progress if user id and course id are valid, with no progress if user has not started the course', async () => {
    const userId = 1; const
      courseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => true);
    CourseUser.findOne.mockImplementationOnce(() => false);

    const response = await coursesController.getCourseProgress(userId, courseId);

    expect(CourseUser.findOne).toHaveBeenCalled();
    expect(CourseUser.findOne).toHaveBeenCalledWith({ where: { userId, courseId } });
    expect(Chapter.sum).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      userId,
      courseId,
      hasStarted: false,
      progress: 0,
    });
  });

  it('should return user progress if user id and course id are valid, and if user has started the course', async () => {
    const userId = 1;
    const courseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => true);
    CourseUser.findOne.mockImplementationOnce(() => ({ doneActivities: 5 }));
    Chapter.sum.mockImplementationOnce(() => 10);
    Chapter.sum.mockImplementationOnce(() => 10);

    const response = await coursesController.getCourseProgress(userId, courseId);

    expect(CourseUser.findOne).toHaveBeenCalled();
    expect(CourseUser.findOne).toHaveBeenCalledWith({ where: { userId, courseId } });
    expect(Chapter.sum).toHaveBeenCalled();
    expect(Chapter.sum).toHaveBeenCalledWith('exercisesQuantity', { where: { courseId } });
    expect(Chapter.sum).toHaveBeenCalledWith('theoryQuantity', { where: { courseId } });
    expect(response).toMatchObject({
      userId,
      courseId,
      hasStarted: true,
      progress: 25,
    });
  });

  it('should throw NotFoundError if sent user id is invalid', async () => {
    User.findByPk.mockImplementationOnce(() => false);

    const testedFunction = coursesController.getCourseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent course id is invalid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => false);

    const testedFunction = coursesController.getCourseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});

describe('Testing function onGoingCoursesByUser', () => {
  it('should return array with next topic id', async () => {
    const userId = 1;

    Course.findAll.mockImplementationOnce(() => new Array(5).fill({ id: 1, dataValues: {} }));

    const spyFn = jest.spyOn(topicsController, 'getLastTopicDoneAtCourse');
    topicsController.getLastTopicDoneAtCourse.mockResolvedValue(5);

    const courses = await coursesController.getOngoingCoursesByUser(userId);

    expect(spyFn).toHaveBeenCalledTimes(5);
    expect(spyFn).toHaveBeenCalledWith(1, 1);
    expect(courses).toEqual(expect.arrayContaining([
      { id: 1, dataValues: { nextTopicId: 5 } },
      { id: 1, dataValues: { nextTopicId: 5 } },
      { id: 1, dataValues: { nextTopicId: 5 } },
      { id: 1, dataValues: { nextTopicId: 5 } },
      { id: 1, dataValues: { nextTopicId: 5 } },
    ]));

    spyFn.mockRestore();
  });
});

describe('Testing getOngoingCoursesByUser', () => {
  it('Should return a throw error trying to search for user courses that dont exist', async () => {
    User.findOne.mockImplementation(null);

    async function user() {
      return coursesController.getOngoingCoursesByUser(9999);
    }

    expect(user).rejects.toThrow(NotFoundError);
  });
});
