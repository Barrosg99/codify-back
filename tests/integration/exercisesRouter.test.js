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
  createExercise,
  createAdminSession,
} = require('../utils');

const app = require('../../src/app');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let adminToken;
let courseId;
let topicId;
let chapterId;
let exerciseId;
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

  const testExercise = await createExercise(db, topicId);
  exerciseId = testExercise.id;

  adminToken = await createAdminSession(db);
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
});

describe('GET /admin/exercises', () => {
  it('should return 200 and the lsit of exercises', async () => {
    const { body, status } = await agent.get('/admin/exercises').set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        topicId,
        enunciated: 'Teste',
      }),
    ]));
  });
});

describe('GET /admin/exercises/:id', () => {
  it('should return 200 and the theory found by the id', async () => {
    const { status, body } = await agent.get(`/admin/exercises/${exerciseId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining({
      topicId,
      enunciated: 'Teste',
    }));
  });
});

describe('PUT /admin/exercises/:id', () => {
  it('should update theory data', async () => {
    const exercise = {
      id: exerciseId,
      topicId,
      enunciated: 'Teste Novo',
      initialCode: 'Teste',
      tests: 'Teste',
      language: 'javascript',
      feedback: 'solution',
    };

    const { status, body } = await agent.put(`/admin/exercises/${exerciseId}`).set('Authorization', `Bearer ${adminToken}`).send(exercise);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(exercise));
  });
});

describe('POST /admin/exercises', () => {
  it('should return 201 and the exercises created', async () => {
    const exercise = {
      topicId,
      enunciated: 'Teste Criado',
      initialCode: 'Teste',
      tests: 'Teste',
      language: 'javascript',
      feedback: 'solution',
    };

    const { status, body } = await agent.post('/admin/exercises').set('Authorization', `Bearer ${adminToken}`).send(exercise);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(exercise));
  });
});

describe('DEL /admin/exercises/:id', () => {
  it('should change excluded flag to true', async () => {
    const { status, body } = await agent.del(`/admin/exercises/${exerciseId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body.excluded).toBe(true);
  });
});
