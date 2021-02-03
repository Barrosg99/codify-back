const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
const bcrypt = require('bcrypt');
const User = require('../models/User');

class UsersController {
	async create({ name, password, email, avatarUrl }) {
		avatarUrl = !avatarUrl ? null : avatarUrl;
		password = bcrypt.hashSync(password, 10);
		const user = await User.create({ name, email, password, avatarUrl }, { returning: true, raw: true });
		delete user.dataValues.password;
		return user; 
	}

	async findByEmail(email) {
		return await User.findOne({ where: { email } });
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

module.exports = new UsersController;
