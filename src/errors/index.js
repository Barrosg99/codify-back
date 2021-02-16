const ActivitiesNotCompletedError = require('./ActivitiesNotCompletedError');
const AuthError = require('./AuthError');
const ConflictError = require('./ConflictError');
const JwtError = require('./JwtError');
const NotFoundError = require('./NotFoundError');
const WrongPasswordError = require('./WrongPasswordError');

module.exports = {
  ActivitiesNotCompletedError,
  AuthError,
  ConflictError,
  JwtError,
  NotFoundError,
  WrongPasswordError,
};
