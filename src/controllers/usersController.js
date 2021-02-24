const bcrypt = require('bcrypt');
const axios = require('axios');

const {
  AdminSession,
  Session,
  User,
} = require('../models');

const Redis = require('../utils/redis');

const {
  NotFoundError,
  WrongPasswordError,
  AuthError,
  ConflictError,
  SendGridError,
} = require('../errors');

const { getEmailMessage } = require('../utils/helpers');

class UsersController {
  async create({
    name, password, email, avatarUrl,
  }) {
    const emailAlredyUsed = await this.findByEmail(email);

    if (emailAlredyUsed) {
      throw new ConflictError();
    }

    avatarUrl = !avatarUrl ? null : avatarUrl;
    password = bcrypt.hashSync(password, 10);
    const user = await User.create({
      name, email, password, avatarUrl,
    }, { returning: true, raw: true });
    delete user.dataValues.password;
    return user;
  }

  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async createSession(email, password) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const passwordComparison = bcrypt.compareSync(password, user.password);
    if (!passwordComparison) {
      throw new WrongPasswordError('Password is incorrect');
    }

    const token = await Redis.setSession({ id: user.id });

    return {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      token,
      hasInitAnyCourse: user.hasInitAnyCourse,
    };
  }

  findSessionById(id) {
    return Session.findByPk(id);
  }

  async postAdminSignIn(username, password) {
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      throw new AuthError('Wrong username or password');
    }

    const token = await Redis.setSession({ id: process.env.ADMIN_ID });
    return token;
  }

  async postAdminSignOut(id) {
    return Redis.deleteSession(id);
  }

  findAdminSessionById(id) {
    return AdminSession.findByPk(id);
  }

  async postUserSignOut(id) {
    return Redis.deleteSession(id);
  }

  async sendPwdRecoveryEmail(email) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const token = await Redis.setSession({ id: user.id });

    const html = getEmailMessage(user, token);

    const msg = {
      to: email,
      from: 'noreply.codify@gmail.com',
      subject: 'Codify - Recuperação de senha',
      html,
    };

    const data = {
      personalizations: [
        {
          to: [
            {
              email,
              name: user.name,
            },
          ],
          subject: 'Codify - Recuperação de senha',
        },
      ],
      from: {
        email: 'noreply.codify@gmail.com',
        name: 'Codify',
      },
      reply_to: {
        email: 'noreply.codify@gmail.com',
        name: 'Codify',
      },
      content: [{ value: html, type: 'text/html' }],
    };

    const request = await axios.post('https://api.sendgrid.com/v3/mail/send', { ...data }, { headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' } });
    if (request.status !== 202) {
      throw new SendGridError('Email could not be send');
    }
  }

  async changePassword(userId, sessionId, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');

    const hashPassword = bcrypt.hashSync(newPassword, 10);

    user.password = hashPassword;
    await user.save();

    await Redis.deleteSession(sessionId);
  }
}

module.exports = new UsersController();
