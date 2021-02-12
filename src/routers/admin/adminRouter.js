const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const adminChaptersRouter = require('./adminChaptersRouter');
const adminTopicsRouter = require('./adminTopicsRouter');
const adminTheoriesRouter = require('./adminTheoriesRouter');
const adminExercisesRouter = require('./adminExercisesRouter');
const { verifyJWT, verifyAdmin } = require('../../middlewares');
// verifyJWT, verifyAdmin,
router.use('/users', adminUsersRouter);
router.use('/courses', adminCoursesRouter);
router.use('/chapters', adminChaptersRouter);
router.use('/topics', adminTopicsRouter);
router.use('/theories', adminTheoriesRouter);
router.use('/exercises', adminExercisesRouter);

module.exports = router;
