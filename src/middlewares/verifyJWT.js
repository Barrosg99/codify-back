const jwt = require('jsonwebtoken');
const { AuthError } = require('../errors');

async function verifyJWT(req, res, next) {
  const header = req.header('Authorization');
  const token = header.split(' ')[1];
  if (!token || !header) throw new AuthError();

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) throw new AuthError();

    if (req.originalUrl === '/users/password-reset') {
      req.userId = decoded.id;
    } else {
      req.sessionId = decoded.id;
    }
  });

  next();
}

module.exports = verifyJWT;
