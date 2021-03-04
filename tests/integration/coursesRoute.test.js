/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  createCoursesUtils,
  cleanDataBase,
  createAdminSession,
  createUserSession,
  createChapters,
  createTopic,
  createTheory,
  createExercise,
} = require('../utils');

const app = require('../../src/app');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let adminToken;
let userToken;
let courseId;
let chapterId;
let topicId;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await cleanDataBase(db);

  courseId = await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para vc ficar voando mesmo tipo mostrão no JS',
    '#FFF',
    'https://i.imgur.com/lWUs38z.png',
  );

  const testChapter = await createChapters(db, courseId, 'Teste', 1, 1, 1, 1);
  chapterId = testChapter.id;

  const testTopic = await createTopic(db, chapterId);
  topicId = testTopic.id;

  const testTheory = await createTheory(db, topicId);
  theoryId = testTheory.id;

  const testExercise = await createExercise(db, topicId);
  exerciseId = testExercise.id;

  adminToken = await createAdminSession(db);
  const session = await createUserSession(db);
  userToken = session.userToken;
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
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
          color: '#FFF',
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
      color: '#FFF',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    });
  });
});

describe('POST /courses/:courseId/users', () => {
  it('Should return status code 200 when sucess to init course', async () => {
    const result = await db.query('SELECT * FROM courses LIMIT 1');
    const course = result.rows[0];

    const response = await agent.post(`/courses/${course.id}/users`).set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
  });
});

describe('GET /suggestions', () => {
  it('Should return an array with a maximum of 6 course suggestions', async () => {
    const newUser = {
      name: 'Minervaa',
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
    const response = await agent.get(`/courses/${courseId}/chapters`).set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: courseId,
      title: 'JavaScript do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no JS',
      color: '#FFF',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
      chapters: expect.arrayContaining([
        expect.objectContaining({
          id: chapterId,
          name: 'Teste',
          excluded: false,
          order: 1,
          topicsQuantity: 1,
          theoryQuantity: 1,
          exercisesQuantity: 1,
          topics: [
            {
              id: topicId,
              chapterId,
              excluded: false,
              name: 'Teste',
              order: 1,
              userHasFinished: false,
            },
          ],
        }),
      ]),
    });
  });
});
