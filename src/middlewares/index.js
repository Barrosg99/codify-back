const verifyJWT = require('./validation');
const verifyAdmin = require('./verifyAdmin');
const verifyClient = require('./verifyClient');

module.exports = {
  verifyAdmin,
  verifyClient,
  verifyJWT,
};
