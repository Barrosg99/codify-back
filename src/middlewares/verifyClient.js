const usersController = require('../controllers/usersController');

module.exports = async (req, res, next) => {
  if (!await usersController.findSessionById(req.sessionId)) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });

  next();
};
