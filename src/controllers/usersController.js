const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Session = require('../models/Session');
const NotFoundError = require('../errors/NotFoundError');
const WrongPasswordError = require('../errors/WrongPasswordError');

class UsersController {
	async create({ name, password, email, avatarUrl }) {
		avatarUrl = !avatarUrl ? null : avatarUrl;
		password = bcrypt.hashSync(password, 10);
		const user = await User.create({ name, email, password, avatarUrl }, { returning: true, raw: true });
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
		
		await Session.create({ userId: user.id });
		const token = jwt.sign({ id: user.id }, process.env.SECRET);

		return {
			userId: user.id,
			name: user.name,
			avatarUrl: user.avatarUrl,
			token
		};
	}

	async postAdminSignIn(username, password) {
		if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
			throw new AuthError('Wrong username or password');
		}

		const id = process.env.ADMIN_ID;
		const token = jwt.sign({ id }, process.env.SECRET);
		return token;
	}
}


module.exports = new UsersController();
