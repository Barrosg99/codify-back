/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils, cleanDataBase, createUserSession,
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
    const newChapter = await db.query(
      'INSERT INTO chapters ("courseId", name, "order", "topicsQuantity", "exercisesQuantity", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [courseId, 'Teste', 1, 1, 1, new Date(), new Date()],
    );
    chapterId = newChapter.rows[0].id;

    const newTopic = await db.query(
      'INSERT INTO topics ("chapterId", name, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chapterId, 'Teste', 1, new Date(), new Date()],
    );
    topicId = newTopic.rows[0].id;

    const newTheory = await db.query(
      'INSERT INTO theories (id, "topicId", "youtubeUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, topicId, 'https://youtube.com', new Date(), new Date()],
    );
    theoryId = newTheory.rows[0].id;

    const newExercise = await db.query(
      'INSERT INTO exercises (id, description, "topicId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, 'Teste', topicId, new Date(), new Date()],
    );
    exerciseId = newExercise.rows[0].id;

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
