const User = require('../models/User');

class UsersController {
	async create({ name, password, email, avatarUrl }) {
		avatarUrl = !avatarUrl ? null : avatarUrl;
		return await User.create({ name, email, password, avatarUrl }, { returning: true, raw: true });
	}

	async findEmail(email) {
		return await User.findOne({ where: { email } });
	}
}

module.exports = new UsersController;