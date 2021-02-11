const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const adminSummariesRouter = require('./adminSummariesRouter');
const { verifyJWT, verifyAdmin } = require('../../middlewares');

router.use('/users', adminUsersRouter);
router.use('/courses', verifyJWT, verifyAdmin, adminCoursesRouter);
router.use('/summaries', verifyJWT, verifyAdmin, adminSummariesRouter);

module.exports = router;
