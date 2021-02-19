const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

const {
  AdminSession,
  CourseUser,
  Course,
  Session,
  User,
} = require('../models');

const Redis = require('../utils/redis');

const {
  NotFoundError,
  WrongPasswordError,
  AuthError,
} = require('../errors');

const { getEmailMessage } = require('../utils/helpers');

class UsersController {
  async create({
    name, password, email, avatarUrl,
  }) {
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

  getOngoingCoursesByUser(id) {
    return Course.findAll({
      include: {
        model: User,
        through: {
          model: CourseUser,
          where: {
            userId: id,
          },
          order: [
            ['updatedAt', 'DESC'],
          ],
        },
      },
    });
  }

  async postUserSignOut(id) {
    return Redis.deleteSession(id);
  }

  async sendPwdRecoveryEmail(email) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundError('User not found');

    const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: 300 });

    const html = getEmailMessage(user, token);

    const msg = {
      to: email,
      from: 'noreply.codify@gmail.com',
      subject: 'Codify - Recuperação de senha',
      html,
    };

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(msg);
  }

  async changePassword(userId, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User not found');

    const hashPassword = bcrypt.hashSync(newPassword, 10);

    user.password = hashPassword;
    await user.save();

    await Session.destroy({ where: { userId } });
  }
}

module.exports = new UsersController();
