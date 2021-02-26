const Joi = require('joi');

const exerciseSchema = Joi.object({
  solutionUser: Joi.string().required(),
});

module.exports = exerciseSchema;
