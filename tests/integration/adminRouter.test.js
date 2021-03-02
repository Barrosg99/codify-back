/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');

const {
  cleanDataBase, createAdminSession,
} = require('../utils');

const app = require('../../src/app');
const Redis = require('../../src/utils/redis');

const agent = supertest(app);
let adminToken;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  await cleanDataBase(db);
  adminToken = await createAdminSession();
});

afterAll(async () => {
  await cleanDataBase(db);
  await db.end();
  await sequelize.close();
  await Redis.close();
});

describe('ADMIN /admin/users/sign-in', () => {
  it('should return 200 when passed user and password correct', async () => {
    const response = await agent.post('/admin/users/sign-in').send({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(response.status).toBe(200);
  });
  it('should return 422 when dont send body', async () => {
    const response = await agent.post('/admin/users/sign-in').send({});

    expect(response.status).toBe(422);
  });
  it('should return 401 when send wrong password', async () => {
    const response = await agent.post('/admin/users/sign-in').send({
      username: process.env.ADMIN_USERNAME,
      password: 'banana',
    });

    expect(response.status).toBe(401);
  });
});

describe('ADMIN /admin/users/sign-out', () => {
  it('should return 401 when not passed headers', async () => {
    const response = await agent.post('/admin/users/sign-out');

    expect(response.status).toBe(401);
  });
  it('should return 200 when passed headers auth', async () => {
    const response = await agent
      .post('/admin/users/sign-out')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });
});
