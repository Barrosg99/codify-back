/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils,
  cleanDataBase,
  createUserSession,
  createChapters,
  createTopic,
  createTheory,
  createExercise,
  createAdminSession,
} = require('../utils');

const app = require('../../src/app');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let userToken;
let adminToken;
let courseId;
let topicId;
let chapterId;
let theoryId;
let exerciseId;
let userId;
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

  const testExercise = await createExercise(db, topicId);
  exerciseId = testExercise.id;

  const session = await createUserSession(db);
  userToken = session.userToken;
  userId = session.userId;

  adminToken = await createAdminSession(db);
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
});

describe('GET /topics/:topicId/users', () => {
  it('should return topic with its theories and exercises if valid topicId is sent', async () => {
    const response = await agent
      .get(`/topics/${topicId}/users`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      id: topicId,
      chapterId,
      name: 'Teste',
      order: 1,
      theories: expect.arrayContaining([
        expect.objectContaining({
          theoryId,
          youtubeUrl: 'https://youtube.com',
          userHasFinished: false,
        }),
      ]),
      exercises: expect.arrayContaining([
        expect.objectContaining({
          exerciseId,
          enunciated: 'Teste',
          userHasFinished: false,
        }),
      ]),
    });
  });

  it('should return user progress as true if he/she finished theory or activity', async () => {
    await db.query(
      'INSERT INTO "theoryUsers" (id, "theoryId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, theoryId, userId, new Date(), new Date()],
    );

    await db.query(
      'INSERT INTO "exerciseUsers" (id, "exerciseId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, exerciseId, userId, new Date(), new Date()],
    );

    const response = await agent
      .get(`/topics/${topicId}/users`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      id: topicId,
      chapterId,
      name: 'Teste',
      order: 1,
      theories: expect.arrayContaining([
        expect.objectContaining({
          theoryId,
          youtubeUrl: 'https://youtube.com',
          userHasFinished: true,
        }),
      ]),
      exercises: expect.arrayContaining([
        expect.objectContaining({
          exerciseId,
          enunciated: 'Teste',
          userHasFinished: true,
        }),
      ]),
    });
  });

  it('should return status code 401 if invalid token is sent', async () => {
    const response = await agent
      .get('/topics/0/users')
      .set('Authorization', 'Bearer invalidToken');
    expect(response.status).toBe(401);
  });

  it('should return status code 404 if required topic does not exist in database', async () => {
    const response = await agent
      .get('/topics/2251/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});

describe('GET /admin/topics', () => {
  it('should return 200 with list of topics', async () => {
    const { body, status } = await agent.get('/admin/topics').set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        chapterId,
        order: 1,
        name: 'Teste',
      }),
    ]));
  });
});

describe('GET /admin/topics/:id', () => {
  it('should return one topic by the id', async () => {
    const { body, status } = await agent.get(`/admin/topics/${topicId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining({
      chapterId,
      order: 1,
      name: 'Teste',
    }));
  });
});

describe('PUT /admin/topics/:id', () => {
  it('should update topic data', async () => {
    const topic = {
      id: topicId,
      chapterId,
      name: 'Novo Teste',
      order: 47,
    };

    const { body, status } = await agent.put(`/admin/topics/${topicId}`).set('Authorization', `Bearer ${adminToken}`).send(topic);

    expect(status).toBe(200);
    expect(body).toEqual(expect.objectContaining(topic));
  });
});

describe('POST /admin/topics', () => {
  it('should create topic and return it', async () => {
    const topic = {
      chapterId,
      name: 'Novo Tópico',
      order: 66,
    };

    const { status, body } = await agent.post('/admin/topics').set('Authorization', `Bearer ${adminToken}`).send(topic);

    expect(status).toBe(201);
    expect(body).toEqual(expect.objectContaining(topic));
  });
});

describe('DEL /admin/topics/:id', () => {
  it('should change excluded flag to true', async () => {
    const { status, body } = await agent.del(`/admin/topics/${topicId}`).set('Authorization', `Bearer ${adminToken}`);

    expect(status).toBe(200);
    expect(body.excluded).toBe(true);
  });
});
