/* eslint-disable no-unused-vars */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

require('./utils/loadRelationships');
require('express-async-errors');

const { verifyJWT, verifyClient } = require('./middlewares');

const adminRouter = require('./routers/admin/adminRouter');

const coursesRouter = require('./routers/client/coursesRouter');
const usersRouter = require('./routers/client/usersRouter');
const topicsRouter = require('./routers/client/topicsRouter');

const {
  AuthError, ConflictError, WrongPasswordError, NotFoundError, NotNextTopicError,
} = require('./errors');

app.use('/courses', verifyJWT, verifyClient, coursesRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/topics', verifyJWT, verifyClient, topicsRouter);

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof NotFoundError) {
    res.status(404);
    console.log(res);
  } else if (error instanceof WrongPasswordError) {
    res.status(401).send({ message: 'Email or password is wrong' });
  } else if (error instanceof NotNextTopicError) {
    res.status(403).send({
      message: 'Activities at this topic not completed by user',
    });
  } else if (error instanceof AuthError) {
    res.status(401);
  } else if (error instanceof ConflictError) {
    res.status(409).send({ message: 'Email alredy used' });
  } else res.status(500).send({ message: 'Ops, unknown error' });
});

module.exports = app;
