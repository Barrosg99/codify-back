const Joi = require('joi');

const adminSignIn = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { adminSignIn };
