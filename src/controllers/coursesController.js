const Course = require('../models/Course');

async function getAll() {
  return Course.findAll();
}

module.exports = { getAll };
