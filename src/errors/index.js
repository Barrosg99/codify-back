const NotNextTopicError = require('./NotNextTopicError');
const AuthError = require('./AuthError');
const ConflictError = require('./ConflictError');
const JwtError = require('./JwtError');
const NotFoundError = require('./NotFoundError');
const WrongPasswordError = require('./WrongPasswordError');

module.exports = {
  NotNextTopicError,
  AuthError,
  ConflictError,
  JwtError,
  NotFoundError,
  WrongPasswordError,
};
