const joi = require('joi');

module.exports = joi.object({
  _end: joi.number().default(null),
  _start: joi.number().default(0),
  _sort: joi.string().default('id'),
  _order: joi.string().valid('ASC', 'DESC').default('ASC'),
  id: joi.number(),
});
