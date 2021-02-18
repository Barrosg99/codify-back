const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const adminChaptersRouter = require('./adminChaptersRouter');
const adminTopicsRouter = require('./adminTopicsRouter');
const adminTheoriesRouter = require('./adminTheoriesRouter');
const adminExercisesRouter = require('./adminExercisesRouter');
const { verifyJWT } = require('../../middlewares');

router.use('/users', adminUsersRouter);
router.use('/courses', verifyJWT, adminCoursesRouter);
router.use('/chapters', verifyJWT, adminChaptersRouter);
router.use('/topics', verifyJWT, adminTopicsRouter);
router.use('/theories', verifyJWT, adminTheoriesRouter);
router.use('/exercises', verifyJWT, adminExercisesRouter);

module.exports = router;
