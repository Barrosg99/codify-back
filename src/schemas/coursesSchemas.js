const Joi = require('joi');

const courseSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  color: Joi.string().min(1).required(),
  imageUrl: Joi.string().min(1).required(),
});

module.exports = { courseSchema };
