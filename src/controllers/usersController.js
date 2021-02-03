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
}

module.exports = new UsersController;