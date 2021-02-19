/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils,
  cleanDataBase,
  createChapters,
  createTopic,
  createTheory,
  createAdminSession,
} = require('../utils');

const app = require('../../src/app');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let adminToken;
let courseId;
let topicId;
let chapterId;
let theoryId;
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

  const testChapter = await createChapters(db, courseId, 'Teste', 1, 1, 1);
  chapterId = testChapter.id;

  const testTopic = await createTopic(db, chapterId);
  topicId = testTopic.id;

  const testTheory = await createTheory(db, topicId);
  theoryId = testTheory.id;

  adminToken = await createAdminSession(db);
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
});

describe('GET /admin/theories', () => {
  it('should return 200 and the lsit of theories', async () => {
    const { body, status } = await agent.get('/admin/theories').set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        topicId,
        youtubeUrl: 'https://youtube.com',
      }),
    ]));
  });
});

describe('GET /admin/theories/:id', () => {
  it('should return 200 and the theory found by the id', async () => {
    const { status, body } = await agent.get(`/admin/theories/${theoryId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining({
      topicId,
      youtubeUrl: 'https://youtube.com',
    }));
  });
});

describe('PUT /admin/theories/:id', () => {
  it('should update theory data', async () => {
    const theory = {
      id: theoryId,
      topicId,
      youtubeUrl: 'www.facebook.com.br',
    };

    const { status, body } = await agent.put(`/admin/theories/${theoryId}`).set('Authorization', `Bearer ${adminToken}`).send(theory);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(theory));
  });
});

describe('POST /admin/theories', () => {
  it('should return 201 and the theory created', async () => {
    const theory = {
      topicId,
      youtubeUrl: 'www.teste.com',
    };

    const { status, body } = await agent.post('/admin/theories').set('Authorization', `Bearer ${adminToken}`).send(theory);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(theory));
  });
});

describe('DEL /admin/theories/:id', () => {
  it('should change excluded flag to true', async () => {
    const { status, body } = await agent.del(`/admin/theories/${theoryId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body.excluded).toBe(true);
  });
});
