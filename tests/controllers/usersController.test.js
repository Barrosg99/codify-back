/* eslint-disable global-require */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');

const { NotFoundError, AuthError, WrongPasswordError } = require('../../src/errors');
const {
  User,
} = require('../../src/models');

const Redis = require('../../src/utils/redis');

jest.mock('../../src/models/Session');
jest.mock('../../src/models/User');

jest.mock('../../src/utils/redis', () => ({
  setSession: ({ id }) => id,
}));

jest.mock('jsonwebtoken', () => ({
  sign: () => 'token',
}));

jest.mock('bcrypt', () => ({
  compareSync: (password, hashPassword) => password === hashPassword,
  hashSync: () => 'password',
}));

jest.mock('@sendgrid/mail');

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
    jest.spyOn(User, 'findOne');

    const user = {
      name: 'joao',
      email: 'joao@mail.com',
      password: 'banana123',
      avatarUrl: 'url.com.br',
    };

    User.findOne.mockImplementationOnce(() => null);
    User.create.mockImplementationOnce(() => ({ dataValues: { ...user } }));

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
    usersController.findByEmail.mockResolvedValueOnce(
      {
        id: 1, name: 'Teste', email: userEmail, password: 'password', avatarUrl: 'https://avatar.com',
      },
    );

    const response = await usersController.createSession(userEmail, password);

    expect(usersController.findByEmail).toHaveBeenCalledWith(userEmail);
    expect(response).toMatchObject({
      userId: 1,
      name: 'Teste',
      avatarUrl: 'https://avatar.com',
      token: 1,
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
    const spy = jest.spyOn(Redis, 'setSession');

    const login = await usersController.postAdminSignIn(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
    );

    expect(Redis.setSession).toHaveBeenCalledWith({ id: process.env.ADMIN_ID });
    expect(login).toEqual(process.env.ADMIN_ID);

    spy.mockRestore();
  });
});

describe('function sendPwdRecoveryEmail', () => {
  it('should send email to user if sent user id is valid', async () => {
    const sgMail = require('@sendgrid/mail');
    const email = 'teste@teste.com';
    const userName = 'Eustáquio';

    const spy = jest.spyOn(usersController, 'findByEmail');
    usersController.findByEmail.mockResolvedValueOnce({ id: 1, name: userName });

    await usersController.sendPwdRecoveryEmail(email);

    spy.mockRestore();

    expect(sgMail.setApiKey).toHaveBeenCalled();
    expect(sgMail.setApiKey).toHaveBeenCalledWith(process.env.SENDGRID_API_KEY);
    expect(sgMail.send).toHaveBeenCalled();
    expect(sgMail.send).toHaveBeenCalledWith({
      to: email,
      from: 'noreply.codify@gmail.com',
      subject: 'Codify - Recuperação de senha',
      html: expect.any(String),
    });
    expect(sgMail.send.mock.calls[0][0].html).toMatch(userName);
    expect(sgMail.send.mock.calls[0][0].html).toMatch(/\/1/);
  });
});
