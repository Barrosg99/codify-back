/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils, cleanDataBase, createAdminSession, createChapters,
} = require('../utils');

const app = require('../../src/app');

const agent = supertest(app);
let adminToken;
let courseId;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await cleanDataBase(db);

  courseId = await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para vc ficar voando mesmo tipo mostrão no JS',
    'amarelo',
    'https://i.imgur.com/lWUs38z.png',
  );

  adminToken = await createAdminSession(db);
});

afterAll(async () => {
  // await cleanDataBase(db);
  await db.end();
  await sequelize.close();
});

describe('GET /admin/chapters', () => {
  it('should return 200 with list of chapters', async () => {
    for (let i = 0; i < 3; i += 1) {
      await createChapters(db, courseId, 'Apresentação', 1, 2, 3);
    }

    const { body, status } = await agent.get('/admin/chapters').set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          courseId,
          name: 'Apresentação',
          order: 1,
          topicsQuantity: 2,
          exercisesQuantity: 3,
        }),
        expect.objectContaining({
          id: expect.any(Number),
          courseId,
          name: 'Apresentação',
          order: 1,
          topicsQuantity: 2,
          exercisesQuantity: 3,
        }),
        expect.objectContaining({
          id: expect.any(Number),
          courseId,
          name: 'Apresentação',
          order: 1,
          topicsQuantity: 2,
          exercisesQuantity: 3,
        }),
      ]),
    );
  });
});
