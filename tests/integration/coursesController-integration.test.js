/* eslint-disable no-undef */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const { createCoursesUtils } = require('../utils');

const app = require('../../src/app');

const agent = supertest(app);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const id = process.env.ADMIN_ID;
const token = jwt.sign({ id }, process.env.SECRET);

beforeAll(async () => {
  await db.query('DELETE FROM courses;');
  await db.query('ALTER SEQUENCE courses_id_seq RESTART WITH 1;');

  await createCoursesUtils(
    db,
    'JavaScript do zero ao avançado',
    'Curso para vc ficar voando mesmo tipo mostrão no JS',
    'amarelo',
    'https://i.imgur.com/lWUs38z.png',
  );
});

afterAll(async () => {
  await db.end();
  await sequelize.close();
});

describe('GET /courses', () => {
  it('Should return 200 with list of courses', async () => {
    const response = await agent.get('/courses').set('Authorization', `Bearer ${token}`);

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

describe('POST /courses', () => {
  it('Should return 201 status and a object with criated course', async () => {
    const body = {
      title: 'Python do zero ao avançado',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
      color: 'azul',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    };

    const response = await agent
      .post('/admin/courses/')
      .set('Authorization', `Bearer ${token}`)
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

describe('PUT /courses/:id', () => {
  it('Should return 200 status and a object with edited course', async () => {
    const body = {
      title: 'Python é bom demais',
      description: 'Curso para vc ficar voando mesmo tipo mostrão no PY',
      color: 'azul',
      imageUrl: 'https://i.imgur.com/lWUs38z.png',
    };

    const response = await agent
      .put('/admin/courses/2')
      .set('Authorization', `Bearer ${token}`)
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

describe('DELETE /courses/:id', () => {
  it('Should return 204 status if was successfully deleted ', async () => {
    const response = await agent.delete('/admin/courses/2').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(204);
  });
});

describe('GET /courses/:id', () => {
  it('Should return status code 200 and requested course data', async () => {
    const response = await agent.get('/courses/1').set('Authorization', `Bearer ${token}`);

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
