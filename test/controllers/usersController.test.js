/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');
const Session = require('../../src/models/Session');
const NotFoundError = require('../../src/errors/NotFoundError');
const WrongPasswordError = require('../../src/errors/WrongPasswordError');

jest.mock('../../src/models/Session');
jest.mock('jsonwebtoken', () => {
	return {
		sign: () => 'token'
	};
});

jest.mock('bcrypt', () => {
	return {
		compareSync: (password, hashPassword) => password === hashPassword
	};
});

describe('creating new session', () => {
	it('should create session if email is valid and password is correct', async () => {
		

		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findEmail');
		usersController.findEmail.mockImplementationOnce(email => (
			{ id: 1, name: 'Teste', email, password: 'password', avatarUrl: 'https://avatar.com' }
		));

		Session.create.mockResolvedValue(() => true);
		
		const response = await usersController.createSession(email, password);

		expect(usersController.findEmail).toHaveBeenCalled();
		expect(usersController.findEmail).toHaveBeenCalledWith(email);
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

		const spy = jest.spyOn(usersController, 'findEmail');
		usersController.findEmail.mockImplementationOnce(() => false);
		
		const createFunction = usersController.createSession(email, password);

		expect(usersController.findEmail).toHaveBeenCalled();
		expect(usersController.findEmail).toHaveBeenCalledWith(email);
		expect(createFunction).rejects.toThrow(NotFoundError);

		spy.mockRestore();
	});

	it('should throw WrongPasswordError if sent password is incorrect', async () => {
		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findEmail');
		usersController.findEmail.mockImplementationOnce(() => ({ password: 'anotherPassword' }));
		
		const createFunction = usersController.createSession(email, password);

		expect(usersController.findEmail).toHaveBeenCalled();
		expect(usersController.findEmail).toHaveBeenCalledWith(email);
		expect(createFunction).rejects.toThrow(WrongPasswordError);

		spy.mockRestore();
	});
});