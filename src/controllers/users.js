const jwt = require('jsonwebtoken');

const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');

class UserController {
	async createSession() {
		const user = await this._findByEmail(email);
		if (!user) throw new NotFoundError('User not found');
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