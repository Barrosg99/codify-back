const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const { verifyJWT, verifyAdmin } = require('../../middlewares');

router.use('/users', adminUsersRouter);
router.use('/courses', verifyJWT, verifyAdmin, adminCoursesRouter);

module.exports = router;
