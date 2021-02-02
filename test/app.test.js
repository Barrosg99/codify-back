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
		db.query('INSERT INTO users (email) VALUES ($1) ', ['joao@gmail.com']);

		const body = {
			name: 'joao',
			email: 'joao@gmail.com',
			password: 'dahoralek123'
		};
		
		const response = await agent.post('/users/register').send(body);
		expect(response.status).toBe(409);
	});
});