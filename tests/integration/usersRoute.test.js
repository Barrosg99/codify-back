/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');
const app = require('../../src/app');

const {
  createCoursesUtils,
  createUserSession,
  cleanDataBase,
  createChapters,
  createTopic,
  createTheory,
} = require('../utils');

const agent = supertest(app);
let userToken;
let userId;
let chapterId;
let topicId;
let theoryId;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await cleanDataBase(db);
  courseId = await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para você ficar voando mesmo, tipo monstrão no JS',
    '#F5F100',
    'https://i.imgur.com/lWUs38z.png',
  );

  const testChapter = await createChapters(db, courseId, 'Teste', 1, 5, 5);
  chapterId = testChapter.id;

  const testTopic = await createTopic(db, chapterId);
  topicId = testTopic.id;

  const testTheory = await createTheory(db, topicId);
  theoryId = testTheory.id;

  const session = await createUserSession(db);
  userToken = session.userToken;
  userId = session.userId;
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
});

describe('POST /users/register', () => {
  it('should return 422 when missing data', async () => {
    const body = {
      email: 'joao@gmail.com',
      password: 'dahoralek123',
      passwordConfirmation: 'dahoralek123',
    };
    const response = await agent.post('/users/register').send(body);
    expect(response.status).toBe(422);
  });

  it('should return 409 when email already exist', async () => {
    db.query('INSERT INTO users (name,password,email) VALUES ($1,$2,$3) ', ['gabriel', 'zeze123', 'joao@gmail.com']);

    const body = {
      name: 'joao',
      email: 'joao@gmail.com',
      password: 'dahoralek123',
      passwordConfirmation: 'dahoralek123',
    };

    const response = await agent.post('/users/register').send(body);
    expect(response.status).toBe(409);
  });

  it('should return 201 and the created user', async () => {
    const body = {
      name: 'joao',
      email: 'joao@gmail.com.br',
      password: 'dahoralek123',
      passwordConfirmation: 'dahoralek123',
    };
    const response = await agent.post('/users/register').send(body);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      name: 'joao',
      email: 'joao@gmail.com.br',
      avatarUrl: null,
    }));
  });
});

describe('POST /users/sign-in', () => {
  it('should create user session if correct email and password is sent', async () => {
    const newUser = {
      name: 'Osvaldo',
      email: 'o@gmail.com',
      password: 'password',
      passwordConfirmation: 'password',
      avatarUrl: 'https://google.com',
    };

    const testUserData = await agent.post('/users/register').send(newUser);
    const { id } = testUserData.body;

    const body = { email: newUser.email, password: newUser.password };
    const response = await agent.post('/users/sign-in').send(body);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      userId: id,
      name: 'Osvaldo',
      avatarUrl: 'https://google.com',
      token: expect.any(String),
    });
  });

  it('should return status code 404 if sent email is not on database', async () => {
    const body = { email: 'thisemailisnotondatabase@gmail.com', password: 'password' };

    const response = await agent.post('/users/sign-in').send(body);

    expect(response.status).toBe(404);
  });

  it('should return status code 401 if wrong password is sent', async () => {
    await db.query(
      'INSERT INTO users (name, email, password, "avatarUrl") VALUES ($1, $2, $3, $4) RETURNING *',
      ['Amaraldo', 'a@gmail.com', 'password', 'https://google.com'],
    );

    const body = { email: 'a@gmail.com', password: 'wrongPassword' };

    const response = await agent.post('/users/sign-in').send(body);

    expect(response.status).toBe(401);
  });

  it('should return status code 422 if email property is not sent on request body', async () => {
    const body = { name: 'o@gmail.com', password: 'password' };

    const response = await agent.post('/users/sign-in').send(body);

    expect(response.status).toBe(422);
  });

  it('should return status code 422 if password property is not sent on request body', async () => {
    const body = { email: 'o@gmail.com', pwd: 'password' };

    const response = await agent.post('/users/sign-in').send(body);

    expect(response.status).toBe(422);
  });
});

describe('GET /users/courses/:courseId/progress', () => {
  it('should return user progress in a course if both exist with no progress if user has not started the course', async () => {
    const response = await agent
      .get(`/users/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      userId,
      courseId,
      hasStarted: false,
      progress: 0,
    });
  });

  it('should return user progress in a course if both exist', async () => {
    await db.query(
      'INSERT INTO "courseUsers" ("userId", "courseId", "doneActivities", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, courseId, 2, new Date(), new Date()],
    );

    const response = await agent
      .get(`/users/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      userId,
      courseId,
      hasStarted: true,
      progress: 40,
    });
  });

  it('should return status code 404 if invalid user id is sent', async () => {
    const response = await agent
      .get(`/users/courses/${courseId}/progress`)
      .set('Authorization', 'Bearer bcshacbhdbchdshc');

    expect(response.status).toBe(401);
  });

  it('should return status code 404 if invalid course id is sent', async () => {
    const response = await agent
      .get('/users/courses/55165/progress')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});

describe('GET users/courses/ongoing', () => {
  it('Should return an ordered list of this users courses', async () => {
    const newUser = {
      name: 'Hermione',
      email: 'hermione@gmail.com',
      password: '12345',
      passwordConfirmation: '12345',
      avatarUrl: 'https://google.com',
    };

    const user = await agent.post('/users/register').send(newUser);

    const body = { email: user.body.email, password: '12345' };

    await agent.post('/users/sign-in').send(body);

    const response = await agent.get('/users/courses/ongoing').set('Authorization', `Baerer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([]));
  });
});

describe('POST /signOut', () => {
  it('Should only return status 204 after ending the users session', async () => {
    const newUser = {
      name: 'Gina',
      email: 'gina@gmail.com',
      password: '12345',
      passwordConfirmation: '12345',
      avatarUrl: 'https://google.com',
    };

    const user = await agent.post('/users/register').send(newUser);

    const { email } = user.body;
    const body = { email, password: '12345' };

    const userSession = await agent.post('/users/sign-in').send(body);

    const response = await agent.post('/users/signOut').set('Authorization', `Baerer ${userSession.body.token}`);

    expect(response.status).toBe(204);
  });
});

describe('POST /users/theories/:theoryId/progress', () => {
  it('should return status code 201 if user progress has been successfully created', async () => {
    const response = await agent
      .post(`/users/theories/${theoryId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(201);
  });

  it('should return status code 204 if user progress has been successfully deleted', async () => {
    const response = await agent
      .post(`/users/theories/${theoryId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(204);
  });

  it('should return status code 404 if sent theory id is invalid', async () => {
    const response = await agent
      .post('/users/theories/5561128/progress')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it('should return status code 401 if sent token is invalid', async () => {
    const response = await agent
      .post(`/users/theories/${theoryId}/progress`)
      .set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
  });
});
