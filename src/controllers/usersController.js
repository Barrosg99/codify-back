const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

async function postAdminSignIn(username, password) {
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    throw new AuthError('Wrong username or password');
  }

  const id = process.env.ADMIN_ID;

  const token = jwt.sign({ id }, process.env.SECRET);

  return token;
}

module.exports = { postAdminSignIn };
