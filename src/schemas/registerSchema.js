const joi = require('joi');

module.exports = joi.object({
	name: joi.string().required(),
	email: joi.string().email().required(),
	password: joi.string().required(),
	repeatPassword: joi.ref('password'),
	avatarUrl: joi.string().uri()
});