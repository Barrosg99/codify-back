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
} = require('../utils');

const app = require('../../src/app');

const agent = supertest(app);
let userToken;
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
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
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
          description: 'Teste',
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
          description: 'Teste',
          userHasFinished: true,
        }),
      ]),
    });
  });

  it('should return status code 401 if invalid token is sent', async () => {
    const response = await agent
      .get(`/topics/${topicId}/users`)
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });

  it('should return status code 400 if headers are not sent', async () => {
    const response = await agent
      .get(`/topics/${topicId}/users`).set('Authorization', 'Bearer');

    expect(response.status).toBe(401);
  });

  it('should return status code 404 if required topic does not exist in database', async () => {
    const response = await agent
      .get('/topics/2251/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});
