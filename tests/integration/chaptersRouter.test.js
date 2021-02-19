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
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let adminToken;
let courseId;
const chapters = [];
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

  for (let i = 0; i < 3; i += 1) {
    chapters.push(await createChapters(db, courseId, 'Apresentação', 1, 2, 3));
  }

  adminToken = await createAdminSession();
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
});

describe('GET /admin/chapters', () => {
  it('should return 200 with list of chapters', async () => {
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

describe('GET /admin/chapters/:id', () => {
  it('should return 200 with chapter found by id', async () => {
    const chapter = chapters[0];
    delete chapter.createdAt;
    delete chapter.updatedAt;
    const { body, status } = await agent.get(`/admin/chapters/${chapter.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(chapter));
  });
});

describe('POST /admin/chapters', () => {
  it('should create chapter in database and return it', async () => {
    const chapter = {
      courseId,
      name: 'Teste',
      order: 1,
    };

    const { body, status } = await agent.post('/admin/chapters').send(chapter).set('Authorization', `Bearer ${adminToken}`);
    expect(status).toBe(201);
    expect(body).toEqual(expect.objectContaining({
      courseId,
      name: 'Teste',
      order: 1,
    }));
  });
});

describe('PUT /admin/chapters/:id', () => {
  it('should change chapter data', async () => {
    const chapter = chapters[1];

    const updatedChapter = {
      id: chapter.id,
      courseId,
      name: 'Testando mudança',
      order: 35,
    };
    const { body, status } = await agent.put(`/admin/chapters/${chapter.id}`).send(updatedChapter).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(updatedChapter));
  });
});

describe('DEL /admin/chapters/:id', () => {
  it('should change excluded flag to true', async () => {
    const chapter = chapters[2];
    expect(chapter.excluded).toBe(false);

    const { body, status } = await agent.del(`/admin/chapters/${chapter.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(status).toBe(200);
    expect(body.excluded).toBe(true);
  });
});
