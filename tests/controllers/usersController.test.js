/* eslint-disable no-undef */
require('dotenv').config();

const usersController = require('../../src/controllers/usersController');
const Session = require('../../src/models/Session');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const CourseUser = require('../../src/models/CourseUser');
const Chapter = require('../../src/models/Chapter');
const NotFoundError = require('../../src/errors/NotFoundError');
const AuthError = require('../../src/errors/AuthError');
const WrongPasswordError = require('../../src/errors/WrongPasswordError');
const AdminSession = require('../../src/models/AdminSession');

jest.mock('../../src/models/Session');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Course');
jest.mock('../../src/models/CourseUser');
jest.mock('../../src/models/Chapter');

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
    const email = 'teste@gmail.com';
    const password = 'password';

    const spy = jest.spyOn(usersController, 'findByEmail');
    usersController.findByEmail.mockImplementationOnce((emailUser) => (
      {
        id: 1, name: 'Teste', email: emailUser, password: 'password', avatarUrl: 'https://avatar.com',
      }
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
    async function login() {
      return usersController.postAdminSignIn('Paola', '12345');
    }

    expect(login).rejects.toThrow(AuthError);
  });

  it('postAdminSignIn - Should return a token if username and password are correct.', async () => {
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

describe('Testing function getCourseProgress of usersController', () => {
  it('should return user progress if user id and course id are valid, with no progress if user has not started the course', async () => {
    const userId = 1, courseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => true);
    CourseUser.findOne.mockImplementationOnce(() => false);

    const response = await usersController.getCourseProgress(userId, courseId);

    expect(CourseUser.findOne).toHaveBeenCalled();
    expect(CourseUser.findOne).toHaveBeenCalledWith({ where: { userId, courseId } });
    expect(Chapter.sum).not.toHaveBeenCalled();
    expect(response).toMatchObject({
      userId,
      courseId,
      hasStarted: false,
      progress: 0
    });
  });

  it('should return user progress if user id and course id are valid, and if user has started the course', async () => {
    const userId = 1, courseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => true);
    CourseUser.findOne.mockImplementationOnce(() => ({ doneActivities: 5 }));
    Chapter.sum.mockImplementationOnce(() => 26);

    const response = await usersController.getCourseProgress(userId, courseId);

    expect(CourseUser.findOne).toHaveBeenCalled();
    expect(CourseUser.findOne).toHaveBeenCalledWith({ where: { userId, courseId } });
    expect(Chapter.sum).toHaveBeenCalled();
    expect(Chapter.sum).toHaveBeenCalledWith('topicsQuantity', { where: { courseId } });
    expect(response).toMatchObject({
      userId,
      courseId,
      hasStarted: true,
      progress: 19
    });
  });

  it('should throw NotFoundError if sent user id is invalid', async () => {
    User.findByPk.mockImplementationOnce(() => false);

    const testedFunction = usersController.getCourseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent course id is invalid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Course.findByPk.mockImplementationOnce(() => false);

    const testedFunction = usersController.getCourseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});
