/* eslint-disable no-undef */
require('dotenv').config();

const { Pool } = require('pg');
const supertest = require('supertest');
const sequelize = require('../../src/utils/database');
const app = require('../../src/app');

const agent = supertest(app);
const db = new Pool({
	connectionString: process.env.DATABASE_URL,
});

beforeEach(async () => {
	await db.query('DELETE FROM sessions');
	await db.query('DELETE FROM users');
});

afterAll(async () => {
	await db.query('DELETE FROM sessions');
	await db.query('DELETE FROM users');

	await db.end();
	await sequelize.close();
});

describe('POST /users', () => {
	it('should return 422 when missing data', async () => {
		const body = {
			email: 'joao@gmail.com',
			password: 'dahoralek123',
			passwordConfirmation: 'dahoralek123'
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
			passwordConfirmation: 'dahoralek123'
		};

		const response = await agent.post('/users/register').send(body);
		expect(response.status).toBe(409);
	});

	it('should return 201 and the created user', async () => {
		const body = {
			name: 'joao',
			email: 'joao@gmail.com.br',
			password: 'dahoralek123',
			passwordConfirmation: 'dahoralek123'
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

describe('POST /users/sign-in', () => {
	it('should create user session if correct email and password is sent', async () => {
		let body = {
			name: 'Osvaldo',
			email: 'o@gmail.com',
			password: 'password',
			passwordConfirmation: 'password',
			avatarUrl: 'https://google.com',
		};
		
		const testUserData = await agent.post('/users/register').send(body);
		const { id } = testUserData.body;		
		
		body = { email: 'o@gmail.com', password: 'password' };
		const response = await agent.post('/users/sign-in').send(body);

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			userId: id,
			name: 'Osvaldo',
			avatarUrl: 'https://google.com',
			token: expect.any(String)
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
			['Amaraldo', 'a@gmail.com', 'password', 'https://google.com']
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