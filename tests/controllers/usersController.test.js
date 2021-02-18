/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');

const { NotFoundError, AuthError, WrongPasswordError } = require('../../src/errors');
const {
  AdminSession, Session, User,
} = require('../../src/models');

jest.mock('../../src/models/Session');
jest.mock('../../src/models/User');

jest.mock('jsonwebtoken', () => ({
  sign: () => 'token',
}));

jest.mock('bcrypt', () => ({
  compareSync: (password, hashPassword) => password === hashPassword,
  hashSync: () => 'password',
}));

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
      avatarUrl: 'url.com.br',
    };

    User.create.mockImplementation(() => ({ dataValues: { ...user } }));

    const result = await usersController.create(user);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      ...user,
      password: expect.any(String),
    }), { raw: true, returning: true });

    delete user.password;

    expect(result.dataValues).toEqual(user);
  });
});

describe('creating new session', () => {
  it('should create session if email is valid and password is correct', async () => {
    const userEmail = 'teste@gmail.com';
    const password = 'password';

    const spy = jest.spyOn(usersController, 'findByEmail');
    usersController.findByEmail.mockImplementationOnce((emailUser) => (
      {
        id: 1, name: 'Teste', email: emailUser, password: 'password', avatarUrl: 'https://avatar.com',
      }
    ));

    Session.create.mockResolvedValue(() => true);

    const response = await usersController.createSession(userEmail, password);

    expect(usersController.findByEmail).toHaveBeenCalled();
    expect(usersController.findByEmail).toHaveBeenCalledWith(userEmail);
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
  it('Should return a throw error trying to login with wrong username and password.', async () => {
    async function login() {
      return usersController.postAdminSignIn('Paola', '12345');
    }

    expect(login).rejects.toThrow(AuthError);
  });

  it('Should return a token if username and password are correct.', async () => {
    const spy = jest.spyOn(AdminSession, 'create');
    AdminSession.create.mockImplementationOnce((({ userId }) => userId));
    const login = await usersController.postAdminSignIn(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );
    expect(AdminSession.create).toHaveBeenCalledWith({ userId: process.env.ADMIN_ID });
    expect(login).toEqual(expect.any(String));
    spy.mockRestore();
  });
});

describe('Testing getOngoingCoursesByUser', () => {
  it('Should return a throw error trying to search for user courses that dont exist', async () => {
    User.findOne.mockImplementation(null);

    async function user() {
      return usersController.getOngoingCoursesByUser(9999);
    }

    expect(user).rejects.toThrow(NotFoundError);
  });
});
