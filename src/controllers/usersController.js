const User = require('../models/User');

class UsersController {
	async findEmail(email) {
		const user = await User.findOne({ where: { email } });
		return user;
	}
}

module.exports = new UsersController;