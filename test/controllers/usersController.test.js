/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');
const NotFoundError = require('../../src/errors/NotFoundError');
const WrongPasswordError = require('../../src/errors/WrongPasswordError');

jest.mock('jsonwebtoken', () => {
	return {
		sign: () => 'token'
	};
});

describe('creating new session', () => {
	it('should create session if email is valid and password is correct', async () => {
		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findEmail');
		usersController.findEmail.mockImplementationOnce(email => ({ id: 1, email, password: 'password' }));
		
		const response = await usersController.createSession(email, password);

		expect(usersController.findEmail).toHaveBeenCalled();
		expect(usersController.findEmail).toHaveBeenCalledWith(email);
		expect(response).toMatchObject({
			userId: 1,
			token: 'token'
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

	it('should throw WrongPasswordError if sent sent email is not on database', async () => {
		const email = 'teste@gmail.com';
		const password = 'password';

		const spy = jest.spyOn(usersController, 'findEmail');
		usersController.findEmail.mockImplementationOnce(email => ({ id: 1, email, password: 'anotherPassword' }));
		
		const createFunction = usersController.createSession(email, password);

		expect(usersController.findEmail).toHaveBeenCalled();
		expect(usersController.findEmail).toHaveBeenCalledWith(email);
		expect(createFunction).rejects.toThrow(WrongPasswordError);

		spy.mockRestore();
	});
});