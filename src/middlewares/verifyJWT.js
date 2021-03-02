/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const { AuthError } = require('../errors');
const Redis = require('../utils/redis');

async function verifyJWT(req, res, next) {
  const header = req.header('Authorization');
  if (!header) throw new AuthError();

  const token = header.split(' ')[1];
  if (!token) throw new AuthError();

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) throw new AuthError();
  });

  const user = await Redis.getSession(token);
  if (!user) throw new AuthError();

  await Redis.renewSession(token);

  req.userId = user.id;
  req.sessionId = token;

  next();
}

module.exports = verifyJWT;
