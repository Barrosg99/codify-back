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

describe('Testing getOngoingCoursesByUser', () => {
  it('Should return a throw error trying to search for user courses that dont exist', async () => {
    User.findOne.mockImplementation(null);

    async function user() {
      return usersController.getOngoingCoursesByUser(9999);
    }

    expect(user).rejects.toThrow(NotFoundError);
  });
});

describe('Testing function postTheoryProgress', () => {
  it('should return false if user has already done the theory', async () => {
    const userId = 1;
    const theoryId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    TheoryUser.findOne.mockImplementationOnce(() => ({ destroy: () => true }));
    CourseUser.decrement.mockImplementationOnce(() => 0);

    const response = await usersController.postTheoryProgress(userId, theoryId);

    expect(TheoryUser.findOne).toHaveBeenCalledWith({ where: { userId, theoryId } });
    expect(CourseUser.decrement).toHaveBeenCalled();
    expect(CourseUser.decrement).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(false);
  });

  it('should return true if user has not done the theory yet', async () => {
    const userId = 1;
    const theoryId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    TheoryUser.findOne.mockImplementationOnce(() => false);
    TheoryUser.create.mockImplementationOnce(() => true);
    CourseUser.increment.mockImplementationOnce(() => 1);

    const response = await usersController.postTheoryProgress(userId, theoryId);

    expect(TheoryUser.findOne).toHaveBeenCalledWith({ where: { userId, theoryId } });
    expect(TheoryUser.create).toHaveBeenCalled();
    expect(TheoryUser.create).toHaveBeenCalledWith({ userId, theoryId });
    expect(CourseUser.increment).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(true);
  });

  it('should throw NotFoundError if sent userId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => false);
    Theory.findByPk.mockImplementationOnce(() => true);

    const testedFunction = usersController.postTheoryProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent theoryId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Theory.findByPk.mockImplementationOnce(() => false);

    const testedFunction = usersController.postTheoryProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });
});

describe('Testing function postExerciseProgress', () => {
  it('should return false if user has already done the exercise', async () => {
    const userId = 1;
    const exerciseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    ExerciseUser.findOne.mockImplementationOnce(() => ({ destroy: () => true }));
    CourseUser.decrement.mockImplementationOnce(() => 0);

    const response = await usersController.postExerciseProgress(userId, exerciseId);

    expect(ExerciseUser.findOne).toHaveBeenCalledWith({ where: { userId, exerciseId } });
    expect(CourseUser.decrement).toHaveBeenCalled();
    expect(CourseUser.decrement).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(false);
  });

  it('should return true if user has not done the theory yet', async () => {
    const userId = 1;
    const exerciseId = 1;

    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => true);
    Topic.findByPk.mockImplementationOnce(() => ({ chapter: { courseId: 2 } }));
    ExerciseUser.findOne.mockImplementationOnce(() => false);
    ExerciseUser.create.mockImplementationOnce(() => true);
    CourseUser.increment.mockImplementationOnce(() => 1);

    const response = await usersController.postExerciseProgress(userId, exerciseId);

    expect(ExerciseUser.findOne).toHaveBeenCalledWith({ where: { userId, exerciseId } });
    expect(ExerciseUser.create).toHaveBeenCalled();
    expect(ExerciseUser.create).toHaveBeenCalledWith({ userId, exerciseId });
    expect(CourseUser.increment).toHaveBeenCalledWith('doneActivities', { where: { userId, courseId: 2 } });
    expect(response).toBe(true);
  });

  it('should throw NotFoundError if sent userId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => false);
    Exercise.findByPk.mockImplementationOnce(() => true);

    const testedFunction = usersController.postExerciseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if sent theoryId is not valid', async () => {
    User.findByPk.mockImplementationOnce(() => true);
    Exercise.findByPk.mockImplementationOnce(() => false);

    const testedFunction = usersController.postExerciseProgress();

    expect(testedFunction).rejects.toThrow(NotFoundError);
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
    expect(sgMail.send.mock.calls[0][0].html).toMatch(/\?t=token/);
  });
});
