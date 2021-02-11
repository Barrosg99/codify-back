/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../../src/utils/database');
const app = require('../../src/app');

const agent = supertest(app);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let userToken, userId, courseId;

const { createCoursesUtils } = require('../utils');

async function cleanDatabase() {
  await db.query('DELETE FROM "theoryUsers"');
  await db.query('DELETE FROM "topicUsers"');
  await db.query('DELETE FROM "exerciseUsers"');
  await db.query('DELETE FROM theories');
  await db.query('DELETE FROM exercises');
  await db.query('DELETE FROM topics');
  await db.query('DELETE FROM chapters');
  await db.query('DELETE FROM "courseUsers"');
  await db.query('DELETE FROM "adminSessions"');
  await db.query('DELETE FROM sessions');
  await db.query('DELETE FROM courses');
  await db.query('DELETE FROM users');
  await db.query('ALTER SEQUENCE courses_id_seq RESTART WITH 1;');
}

beforeAll(async () => {
  await cleanDatabase();
  courseId = await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para você ficar voando mesmo, tipo monstrão no JS',
    '#F5F100',
    'https://i.imgur.com/lWUs38z.png',
  );

  console.log(courseId);

  const password = bcrypt.hashSync('123456', 10);
  const result = await db.query(
    'INSERT INTO users (name, password, email, "createdAt", "updatedAt") VALUES ($1 , $2, $3, $4, $5) RETURNING *',
    ['Teste de Teste', password, 'teste@teste.com', new Date(), new Date()],
  );
  const user = result.rows[0];

  const sessionUser = await db.query(
    'INSERT INTO sessions ("userId", "createdAt", "updatedAt")VALUES ($1 , $2, $3) RETURNING *',
    [user.id, new Date(), new Date()],
  );

  userToken = jwt.sign({ id: sessionUser.rows[0].id }, process.env.SECRET);
  userId = user.id;
});

afterAll(async () => {
  await cleanDatabase();
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

describe('GET /users/:userId/courses/:courseId/progress', () => {
  it('should return user progress in a course if both exist with no progress if user has not started the course', async () => {
    await db.query(
      'INSERT INTO chapters ("courseId", name, "order", "topicsQuantity", "exercisesQuantity", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [courseId, 'Teste', 1, 9, 0, new Date(), new Date()],
    );

    const response = await agent
      .get(`/users/${userId}/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      userId,
      courseId,
      hasStarted: false,
      progress: 0
    });
  });

  it('should return user progress in a course if both exist', async () => {
    await db.query(
      'INSERT INTO "courseUsers" ("userId", "courseId", "doneActivities", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, courseId, 2, new Date(), new Date()]
    );

    const response = await agent
      .get(`/users/${userId}/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.body).toMatchObject({
      userId,
      courseId,
      hasStarted: true,
      progress: 22
    });
  });

  it('should return status code 404 if invalid user id is sent', async () => {
    const response = await agent
      .get(`/users/65899/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });

  it('should return status code 404 if invalid course id is sent', async () => {
    const response = await agent
      .get(`/users/${userId}/courses/55165/progress`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});
