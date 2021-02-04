/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');
const Session = require('../../src/models/Session');
const User = require('../../src/models/User');
const NotFoundError = require('../../src/errors/NotFoundError');
const AuthError = require('../../src/errors/AuthError');
const WrongPasswordError = require('../../src/errors/WrongPasswordError');

jest.mock('../../src/models/Session');
jest.mock('jsonwebtoken', () => {
	return {
		sign: () => 'token'
	};
});

jest.mock('bcrypt', () => {
	return {
		compareSync: (password, hashPassword) => password === hashPassword,
		hashSync: (password, salt) => 'password'
	};
});

describe('findByEmail', () => {
	it('should call with the right parameters and return an object', async () => {
		jest.spyOn(User, 'findOne');
		User.findOne.mockImplementation((obj) => ({ name: 'fulano', email: obj.where.email }));

		const email = 'joao@mail.com';
		const result = await usersController.findByEmail(email);

		expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
		expect(result).toEqual({ name: 'fulano', email });
	});
});

describe('create', () => {
	it('should call with the right parameters and return an object', async () => {
		jest.spyOn(User, 'create');

		const user = {
			name: 'joao',
			email: 'joao@mail.com',
			password: 'banana123',
			avatarUrl: 'url.com.br'
		};

		User.create.mockImplementation(() => ({ dataValues: { ...user } }));

		const result = await usersController.create(user);
		
		expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
			...user,
			password: expect.any(String),
		}), { 'raw': true, 'returning': true });

		delete user.password;

		expect(result.dataValues).toEqual(user);
	});
});

describe('creating new session', () => {
	it('should create session if email is valid and password is correct', async () => {
		

		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findByEmail');
		usersController.findByEmail.mockImplementationOnce(email => (
			{ id: 1, name: 'Teste', email, password: 'password', avatarUrl: 'https://avatar.com' }
		));

		Session.create.mockResolvedValue(() => true);
		
		const response = await usersController.createSession(email, password);

		expect(usersController.findByEmail).toHaveBeenCalled();
		expect(usersController.findByEmail).toHaveBeenCalledWith(email);
		expect(response).toMatchObject({
			userId: 1,
			name: 'Teste',
			avatarUrl: 'https://avatar.com',
			token: 'token',
		});

		spy.mockRestore();
	});

	it('should throw NotFoundError if sent sent email is not on database', async () => {
		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findByEmail');
		usersController.findByEmail.mockImplementationOnce(() => false);
		
		const createFunction = usersController.createSession(email, password);

		expect(usersController.findByEmail).toHaveBeenCalled();
		expect(usersController.findByEmail).toHaveBeenCalledWith(email);
		expect(createFunction).rejects.toThrow(NotFoundError);

		spy.mockRestore();
	});

	it('should throw WrongPasswordError if sent password is incorrect', async () => {
		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findByEmail');
		usersController.findByEmail.mockImplementationOnce(() => ({ password: 'anotherPassword' }));
		
		const createFunction = usersController.createSession(email, password);

		expect(usersController.findByEmail).toHaveBeenCalled();
		expect(usersController.findByEmail).toHaveBeenCalledWith(email);
		expect(createFunction).rejects.toThrow(WrongPasswordError);

		spy.mockRestore();
	});
});

describe('Testing postAdminSignIn of usersController', () => {
  it('postAdminSignIn - Should return a throw error trying to login with wrong username and password.', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'admin';

    async function login() {
      return await usersController.postAdminSignIn('Paola', '12345');
    }

    expect(login).rejects.toThrow(AuthError);
  });

  it('postAdminSignIn - Should return a token if username and password are correct.', async () => {
		const login = await usersController.postAdminSignIn(
			process.env.ADMIN_USERNAME,
			process.env.ADMIN_PASSWORD
		);

    expect(login).toEqual(expect.any(String));
  });
});