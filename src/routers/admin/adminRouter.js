const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const { verifyJWT } = require('../../middlewares/validation');

router.use('/users', adminUsersRouter);
router.use('/courses', verifyJWT, adminCoursesRouter);

module.exports = router;
