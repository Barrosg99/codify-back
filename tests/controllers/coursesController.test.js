require('dotenv').config();

const coursesController = require('../../src/controllers/coursesController');
const ConflictError = require('../../src/errors/ConflictError');
const NotFoundError = require('../../src/errors/NotFoundError');
const Course = require('../../src/models/Course');

jest.mock('../../src/models/Course.js');

describe('POST /course', () => {
  it('createCourse - should return an throw error trying to create a course that already exists.', async () => {
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
    Course.findByPk.mockResolvedValue(null);

    async function course() {
      return await coursesController.deleteCourse(2);
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
			color: 'yellow',
			imageUrl: 'https://google.com'
		});

		const response = await coursesController.getOne(1);

		expect(response).toMatchObject({
			id: 1,
			title: 'JavaScript',
			description: 'JS course',
			color: 'yellow',
			imageUrl: 'https://google.com'
		});
	});

	it('should throw NotFoundError if required course is not on database', async () => {
		Course.findByPk.mockResolvedValueOnce(null);

		const response = coursesController.getOne(1);

		expect(response).rejects.toThrow(NotFoundError);
	});
});
