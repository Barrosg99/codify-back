/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');
const User = require('../../src/models/User');


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