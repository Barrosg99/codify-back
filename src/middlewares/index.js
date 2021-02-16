const verifyJWT = require('./verifyJWT');
const verifyAdmin = require('./verifyAdmin');
const verifyClient = require('./verifyClient');

module.exports = {
  verifyAdmin,
  verifyClient,
  verifyJWT,
};
