const jwt = require('jsonwebtoken');

const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const WrongPasswordError = require('../errors/WrongPasswordError');

class UserController {
	async createSession(email, password) {
		const user = await this._findByEmail(email);
		if (!user) throw new NotFoundError('User not found');

		if (user.password !== password) {
			throw new WrongPasswordError('Password is incorrect');
		}

		const token = jwt.sign({ id: user.id }, process.env.SECRET);

		return { userId: user.id, token };
	}

	_findByEmail(email) {
		return User.findOne({
			where: { email },
			attributes: {
				exclude: ['createdAt', 'updatedAt']
			}
		});
	}
}

module.exports = new UserController();