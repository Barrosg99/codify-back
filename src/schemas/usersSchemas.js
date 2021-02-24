const Joi = require('joi');

const adminSignIn = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const recoveryEmail = Joi.object({
  email: Joi.string().email().required(),
});

const newPassword = Joi.object({
  password: Joi.string().required(),
  passwordConfirmation: Joi.string().valid(Joi.ref('password')).required(),
});

const updateUser = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(8),
}).min(1);

module.exports = {
  adminSignIn, recoveryEmail, newPassword, updateUser,
};
