const jwt = require('jsonwebtoken');

const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const WrongPasswordError = require('../errors/WrongPasswordError');

class UsersController {
	async createSession(email, password) {
		const user = await this.findEmail(email);
		if (!user) throw new NotFoundError('User not found');

		if (user.password !== password) {
			throw new WrongPasswordError('Password is incorrect');
		}

		const token = jwt.sign({ id: user.id }, process.env.SECRET);

		return { userId: user.id, token };
	}

	async findEmail(email) {
		const user = await User.findOne({ where: { email } });
		return user;
	}
}

module.exports = new UsersController();