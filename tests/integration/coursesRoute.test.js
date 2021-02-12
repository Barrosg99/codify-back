/* eslint-disable no-undef */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils, cleanDataBase, createAdminSession, createUserSession,
} = require('../utils');

const app = require('../../src/app');

const agent = supertest(app);
let adminToken;
let userToken;
let userId;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await cleanDataBase(db);

  await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para vc ficar voando mesmo tipo mostrão no JS',
    'amarelo',
    'https://i.imgur.com/lWUs38z.png',
  );

  adminToken = await createAdminSession(db);
  const session = await createUserSession(db);
  userToken = session.userToken;
  userId = session.userId;
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
});

describe('GET /admin/courses', () => {
  it('Should return 200 with list of courses', async () => {
    const response = await agent.get('/admin/courses').set('Authorization', `Bearer ${adminToken}`);

    const allCourses = response.body;

    expect(response.status).toBe(200);

    expect(allCourses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          title: 'JavaScript do zero ao avançado',
          description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
          color: 'amarelo',
          imageUrl: 'https://i.imgur.com/lWUs38z.png',
        }),
      ]),
    );
  });
});

describe('POST /admin/courses', () => {
  it('Should return 201 status and a object with criated course', async () => {
    const body = {
      title: 'Python do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
      color: 'azul',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    };

    const response = await agent
      .post('/admin/courses/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 2,
        title: 'Python do zero ao avançado',
        description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
        color: 'azul',
        imageUrl: 'https://i.imgur.com/lWUs38z.png',
      }),
    );
  });
});

describe('PUT /admin/courses/:id', () => {
  it('Should return 200 status and a object with edited course', async () => {
    const body = {
      title: 'Python é bom demais',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
      color: 'azul',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    };

    const response = await agent
      .put('/admin/courses/2')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 2,
        title: 'Python é bom demais',
        description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
        color: 'azul',
        imageUrl: 'https://i.imgur.com/lWUs38z.png',
      }),
    );
  });
});

describe('DELETE /admin/courses/:id', () => {
  it('Should return 204 status if was successfully deleted ', async () => {
    const response = await agent.delete('/admin/courses/2').set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(204);
  });
});

describe('GET /admin/courses/:id', () => {
  it('Should return status code 200 and requested course data', async () => {
    const response = await agent.get('/admin/courses/1').set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      title: 'JavaScript do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
      color: 'amarelo',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    });
  });
});

describe('POST /courses/:courseId/users/:userId', () => {
  it('Should return status code 200 when sucess to init course', async () => {
    const result = await db.query('SELECT * FROM courses LIMIT 1');
    const course = result.rows[0];

    const response = await agent.post(`/courses/${course.id}/users/${userId}`).set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
  });
  it('Should return status code 404 when not pass correct ids', async () => {
    const response = await agent.post('/courses/1/users/1').set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});

describe('GET /suggestions', () => {
  it('Should return an array with a maximum of 6 course suggestions', async () => {
    const newUser = {
      name: 'Minerva',
      email: 'minerva@gmail.com',
      password: '12345',
      passwordConfirmation: '12345',
      avatarUrl: 'https://google.com',
    };

    const user = await agent.post('/users/register').send(newUser);

    const { email } = user.body;
    const body = { email, password: '12345' };

    const userSession = await agent.post('/users/sign-in').send(body);
    const response = await agent.get('/courses/suggestions').set('Authorization', `Bearer ${userSession.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveLength(7);
  });
});

describe('GET /courses/:courseId/chapters/:chapterId', () => {
  it('Should return status code 200 with list of topic at chapter without user complet topic', async () => {
    const result = await db.query('SELECT * FROM courses LIMIT 1');
    const course = result.rows[0];

    const resultChapter = await db.query(
      'INSERT INTO chapters ("courseId", name, "order", "topicsQuantity", "exercisesQuantity", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [course.id, 'Teste', 1, 1, 0, new Date(), new Date()],
    );
    const chapter = resultChapter.rows[0];

    const resultTopic = await db.query(
      'INSERT INTO topics ("chapterId", name, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [chapter.id, 'Teste', 1, new Date(), new Date()],
    );
    const topic = resultTopic.rows[0];

    const response = await agent.get(`/courses/${course.id}/chapters/${chapter.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: chapter.id,
      name: chapter.name,
      order: chapter.order,
      topicsQuantity: chapter.topicsQuantity,
      exercisesQuantity: chapter.exercisesQuantity,
      topics: [
        {
          id: topic.id,
          chapterId: chapter.id,
          name: topic.name,
          order: topic.order,
          topicUsers: [],
        },
      ],
    });
  });

  it('Should return status code 200 with list of topic at chapter with user complet topic', async () => {
    const result = await db.query('SELECT * FROM courses LIMIT 1');
    const course = result.rows[0];

    const resultChapter = await db.query(
      'SELECT * FROM chapters WHERE "courseId"=$1 LIMIT 1',
      [course.id],
    );
    const chapter = resultChapter.rows[0];

    const resultTopic = await db.query(
      'SELECT * FROM topics WHERE "chapterId"=$1 LIMIT 1',
      [chapter.id],
    );
    const topic = resultTopic.rows[0];
    console.log(userId, userToken);
    await db.query(
      'INSERT INTO "topicUsers" ("topicId", "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4)',
      [topic.id, userId, new Date(), new Date()],
    );

    const response = await agent.get(`/courses/${course.id}/chapters/${chapter.id}`).set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: chapter.id,
      name: chapter.name,
      order: chapter.order,
      topicsQuantity: chapter.topicsQuantity,
      exercisesQuantity: chapter.exercisesQuantity,
      topics: [
        {
          id: topic.id,
          chapterId: chapter.id,
          name: topic.name,
          order: topic.order,
          topicUsers: [{
            userId,
          }],
        },
      ],
    });
  });
});
