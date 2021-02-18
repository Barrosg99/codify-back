const usersController = require('../controllers/usersController');

module.exports = async (req, res, next) => {
  const session = await usersController.findSessionById(req.sessionId);
  if (!session) {
    return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
  }
  req.userId = session.userId;
  next();
};
