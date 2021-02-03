/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../src/utils/database');
const app = require('../src/app');

const agent = supertest(app);
const db = new Pool({
	connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
	await db.query('DELETE FROM users');
});

afterAll(async () => {
	await db.end();
	await sequelize.close();
});

describe('POST /users', () => {
	it('should return 422 when missing data', async () => {
		const body = {
			email: 'joao@gmail.com',
			password: 'dahoralek123'
		};
		const response = await agent.post('/users/register').send(body);
		expect(response.status).toBe(422);
	});

	it('should return 409 when email already exist', async () => {
		db.query('INSERT INTO users (name,password,email) VALUES ($1,$2,$3) ', ['gabriel', 'zeze123', 'joao@gmail.com']);

		const body = {
			name: 'joao',
			email: 'joao@gmail.com',
			password: 'dahoralek123'
		};

		const response = await agent.post('/users/register').send(body);
		expect(response.status).toBe(409);
	});

	it('should return 201 and the created user', async () => {
		const body = {
			name: 'joao',
			email: 'joao@gmail.com.br',
			password: 'dahoralek123'
		};
		const response = await agent.post('/users/register').send(body);
		expect(response.status).toBe(201);
		expect(response.body).toEqual(expect.objectContaining({
			id: expect.any(Number),
			name: 'joao',
			email: 'joao@gmail.com.br',
			avatarUrl: null
		}));
	});
});