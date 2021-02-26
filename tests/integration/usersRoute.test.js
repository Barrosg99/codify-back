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
  createExercise,
} = require('../utils');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let userToken;
let userId;
let userEmail;
let courseId;
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

  const nextTestTopic = await createTopic(db, chapterId, 2);
  nextTopicId = nextTestTopic.id;

  const testTheory = await createTheory(db, topicId);
  theoryId = testTheory.id;

  const testExercise = await createExercise(db, topicId);
  exerciseId = testExercise.id;

  const session = await createUserSession(db);
  userToken = session.userToken;
  userId = session.userId;
  userEmail = session.userEmail;
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
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
      name: 'joaooooo',
      email: 'joao@gmail.com',
      password: 'dahoralek123',
      passwordConfirmation: 'dahoralek123',
    };

    const response = await agent.post('/users/register').send(body);
    expect(response.status).toBe(409);
  });

  it('should return 201 and the created user', async () => {
    const body = {
      name: 'joaooooo',
      email: 'joao@gmail.com.br',
      password: 'dahoralek123',
      passwordConfirmation: 'dahoralek123',
    };
    const response = await agent.post('/users/register').send(body);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      name: 'joaooooo',
      email: 'joao@gmail.com.br',
      avatarUrl: null,
    }));
  });
});

describe('POST /users/sign-in', () => {
  it('should create user session if correct email and password is sent', async () => {
    const newUser = {
      name: 'Osvaldooo',
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
      name: 'Osvaldooo',
      avatarUrl: 'https://google.com',
      token: expect.any(String),
      hasInitAnyCourse: false,
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

  it('should return status code 401 if invalid token is sent', async () => {
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

describe('GET /users/courses/ongoing', () => {
  it('Should return an empty list when user dont have init course yet', async () => {
    const response = await agent.get('/users/courses/ongoing').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([]));
  });

  it('Should return list with one course when user have init only one course but not finish any topic', async () => {
    await db.query(
      'INSERT INTO "courseUsers" ("userId", "courseId", "createdAt", "updatedAt") VALUES ($1,$2, $3, $4)',
      [userId, courseId, new Date(), new Date()],
    );

    await db.query(
      'UPDATE "users" SET "hasInitAnyCourse"=$1 WHERE id=$2',
      [true, userId],
    );

    const response = await agent.get('/users/courses/ongoing').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([{
      id: courseId,
      title: 'JavaScript do zero ao avançado',
      description: 'Curso para você ficar voando mesmo, tipo monstrão no JS',
      color: '#F5F100',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
      nextTopicId: topicId,
      users: expect.arrayContaining([{
        id: userId,
        hasInitAnyCourse: true,
        courseUser: { userId },
      }]),
    }]));
  });

  it('Should return list with two course when user have init more then one course but not finish any topic', async () => {
    await db.query(
      'INSERT INTO "courseUsers" ("userId", "courseId", "createdAt", "updatedAt") VALUES ($1,$2, $3, $4)',
      [userId, courseId, new Date(), new Date()],
    );

    await db.query(
      'UPDATE "users" SET "hasInitAnyCourse"=$1 WHERE id=$2',
      [true, userId],
    );
    await db.query(
      'INSERT INTO "courseUsers" ("userId", "courseId", "createdAt", "updatedAt") VALUES ($1,$2, $3, $4)',
      [userId, courseId, new Date(), new Date()],
    );

    await db.query(
      'UPDATE "users" SET "hasInitAnyCourse"=$1 WHERE id=$2',
      [true, userId],
    );

    const response = await agent.get('/users/courses/ongoing').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      {
        id: courseId,
        title: 'JavaScript do zero ao avançado',
        description: 'Curso para você ficar voando mesmo, tipo monstrão no JS',
        color: '#F5F100',
        imageUrl: 'https://i.imgur.com/lWUs38z.png',
        nextTopicId: topicId,
        users: expect.arrayContaining([{
          id: userId,
          hasInitAnyCourse: true,
          courseUser: { userId },
        }]),
      },
      {
        id: courseId,
        title: 'JavaScript do zero ao avançado',
        description: 'Curso para você ficar voando mesmo, tipo monstrão no JS',
        color: '#F5F100',
        imageUrl: 'https://i.imgur.com/lWUs38z.png',
        nextTopicId: topicId,
        users: expect.arrayContaining([{
          id: userId,
          hasInitAnyCourse: true,
          courseUser: { userId },
        }]),
      },
    ]));
  });
});

describe('POST /users/topics/:topicId/progress', () => {
  it('return next topic when done topic', async () => {
    const response = await agent
      .post(`/users/topics/${topicId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ nextTopic: nextTopicId });
  });

  it('return 403 when current topic is the last', async () => {
    const response = await agent
      .post(`/users/topics/${nextTopicId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });
});

describe('POST /signOut', () => {
  it('Should only return status 204 after ending the users session', async () => {
    const newUser = {
      name: 'Ginaaaaa',
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

describe('PUT /users/password-reset', () => {
  it('should return status code 204 if password change has been successfully made', async () => {
    const newUser = {
      name: 'Cucaaaaa',
      email: 'cuca@gmail.com',
      password: '12345',
      passwordConfirmation: '12345',
      avatarUrl: 'https://google.com',
    };

    const user = await agent.post('/users/register').send(newUser);

    const { email } = user.body;
    const loginBody = { email, password: '12345' };

    const userSession = await agent.post('/users/sign-in').send(loginBody);

    const body = {
      password: 'newPassword',
      passwordConfirmation: 'newPassword',
    };

    const response = await agent
      .put('/users/password-reset')
      .send(body)
      .set('Authorization', `Bearer ${userSession.body.token}`);

    const oldPasswordAttempt = await agent
      .post('/users/sign-in')
      .send({ email: 'cuca@gmail.com', password: '12345' });

    const newPasswordAttempt = await agent
      .post('/users/sign-in')
      .send({ email: 'cuca@gmail.com', password: 'newPassword' });

    expect(response.status).toBe(204);
    expect(oldPasswordAttempt.status).toBe(401);
    expect(newPasswordAttempt.status).toBe(201);
    expect(newPasswordAttempt.body).toMatchObject({
      userId: user.body.id,
      name: 'Cucaaaaa',
      avatarUrl: 'https://google.com',
      token: expect.any(String),
      hasInitAnyCourse: expect.any(Boolean),
    });
  });
});

describe('PUT /users/change-data', () => {
  it('should return 422 if data is invalid', async () => {
    const body = {};

    const response = await agent
      .put('/users')
      .send(body)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(422);
  });

  it('should 409 if email already exists', async () => {
    const body = {
      email: userEmail,
    };

    const response = await agent
      .put('/users')
      .send(body)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(409);
  });

  it('should change email, name and password and return 204', async () => {
    const body = {
      email: 'gb1999@hotmail.com',
      name: 'Bananana',
      password: 'abba',
      passwordConfirmation: 'abba',
    };

    const { status } = await agent
      .put('/users')
      .send(body)
      .set('Authorization', `Bearer ${userToken}`);

    const user = await db.query('SELECT * FROM users WHERE id=$1', [userId]);
    const { email, name } = user.rows[0];

    expect(status).toBe(204);
    expect(body.email).toBe(email);
    expect(body.name).toBe(name);
  });
});
