/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');
const BadRequestError = require('../errors/BadRequestError');

async function verifyJWT(req, res, next) {
  if (!req.header('Authorization')) throw new BadRequestError();

  const token = req.header('Authorization').split(' ')[1];
  if (!token) throw new AuthError();

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) throw new AuthError();
    req.sessionId = decoded.id;
  });
  next();
}

module.exports = verifyJWT;
