const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Session = require('../models/Session');
const NotFoundError = require('../errors/NotFoundError');
const WrongPasswordError = require('../errors/WrongPasswordError');

class UsersController {
	async createSession(email, password) {
		const user = await this.findEmail(email);
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

	async findEmail(email) {
		const user = await User.findOne({ where: { email } });
		return user;
	}
}

module.exports = new UsersController();