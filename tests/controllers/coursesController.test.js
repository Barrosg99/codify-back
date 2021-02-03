const dotenv = require('dotenv');

dotenv.config();

const { Pool } = require('pg');
const supertest = require('supertest');

const { createCourses } = require('../utils');

const app = require('../../src/app');

const agent = supertest(app);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await db.query('ALTER SEQUENCE courses_id_seq RESTART WITH 1;');
  await db.query('DELETE FROM courses;');
});

afterAll(async () => {
  await db.end();
});

describe('GET /cursos', () => {
  it('Should return 200 with list of courses', async () => {
    createCourses(
      db,
      'JavaScript do zero ao avançado',
      'Curso para vc ficar voando mesmo tipo mostrão no JS',
      'amarelo',
    );

    const response = await agent.get('/cursos');

    const allCourses = response.body;

    expect(response.status).toBe(200);

    expect(allCourses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          title: 'JavaScript do zero ao avançado',
          description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
          color: 'amarelo',
        }),
      ]),
    );
  });
});
