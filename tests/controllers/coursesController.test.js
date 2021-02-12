/* eslint-disable global-require */
/* eslint-disable no-undef */
require('dotenv').config();

const coursesController = require('../../src/controllers/coursesController');
const ConflictError = require('../../src/errors/ConflictError');
const NotFoundError = require('../../src/errors/NotFoundError');
const Course = require('../../src/models/Course');

jest.mock('../../src/models/Course.js');

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

    expect(course).rejects.toThrow(ConflictError);
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

    expect(course).rejects.toThrow(NotFoundError);
  });
});

describe('function deleteCourse', () => {
  it('should return a throw error if the category does not exist.', async () => {
    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return coursesController.deleteCourse(2);
    }

    expect(course).rejects.toThrow(NotFoundError);
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
          exercisesQuantity: 5,
        }
      ]
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
          exercisesQuantity: 5,
        }
      ]
    });
  });

  it('should throw NotFoundError if required course is not on database', async () => {
    Course.findByPk.mockResolvedValueOnce(null);

    const response = coursesController.getOne(1);

    expect(response).rejects.toThrow(NotFoundError);
  });
});
