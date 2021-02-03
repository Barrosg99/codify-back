require('dotenv').config();

const coursesController = require('../../src/controllers/coursesController');
const ConflictError = require('../../src/errors/ConflictError');
const NotFoundError = require('../../src/errors/NotFoundError');

jest.mock('../../src/models/Course.js');

describe('POST /course', () => {
  it('createCourse - should return an throw error trying to create a course that already exists.', async () => {
    const Course = require('../../src/models/Course');

    Course.findOne.mockResolvedValue({
      id: 1,
      title: 'JavaScript do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
      color: 'amarelo',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    });

    async function course() {
      return await coursesController.createCourse(
        'JavaScript do zero ao avançado',
        'Curso para vc ficar voando mesmo tipo mostrão no JS',
        'amarelo',
        'https://i.imgur.com/lWUs38z.png',
      );
    }

    expect(course).rejects.toThrow(ConflictError);
  });
});

describe('PUT /course', () => {
  it('editCourse - should return an throw error trying to edit a course that not exists.', async () => {
    const Course = require('../../src/models/Course');

    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return await coursesController.editCourse(
        'Python é bom demais',
        'Curso para vc ficar voando mesmo tipo mostrão no PY',
        'azul',
        'https://i.imgur.com/lWUs38z.png',
      );
    }

    expect(course).rejects.toThrow(NotFoundError);
  });
});

describe('DELETE /course', () => {
  it('deleteCourse- should return a throw error if the category does not exist.', async () => {
    const Course = require('../../src/models/Course');

    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return await coursesController.deleteCourse(2);
    }

    expect(course).rejects.toThrow(NotFoundError);
  });
});
