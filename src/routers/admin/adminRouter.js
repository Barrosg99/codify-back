const router = require('express').Router();

const adminUsersRouter = require('./adminUsersRouter');
const adminCoursesRouter = require('./adminCoursesRouter');
const adminChaptersRouter = require('./adminChaptersRouter');
const adminTopicsRouter = require('./adminTopicsRouter');
const adminTheoriesRouter = require('./adminTheoriesRouter');
const adminExercisesRouter = require('./adminExercisesRouter');
const { verifyJWT, verifyAdmin } = require('../../middlewares');

router.use('/users', adminUsersRouter);
router.use('/courses', verifyJWT, verifyAdmin, adminCoursesRouter);
router.use('/chapters', verifyJWT, verifyAdmin, adminChaptersRouter);
router.use('/topics', verifyJWT, verifyAdmin, adminTopicsRouter);
router.use('/theories', verifyJWT, verifyAdmin, adminTheoriesRouter);
router.use('/exercises', verifyJWT, verifyAdmin, adminExercisesRouter);

module.exports = router;
