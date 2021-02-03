const joi = require('joi');

module.exports = joi.object({
	name: joi.string().required(),
	email: joi.string().email().required(),
	password: joi.string().required(),
	passwordConfirmation: joi.string().valid(joi.ref('password')).required(),
	avatarUrl: joi.string().uri()
});