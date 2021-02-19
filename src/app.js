/* eslint-disable no-unused-vars */
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

require('./utils/loadRelationships');

const { verifyJWT } = require('./middlewares');

const adminRouter = require('./routers/admin/adminRouter');

const coursesRouter = require('./routers/client/coursesRouter');
const usersRouter = require('./routers/client/usersRouter');
const topicsRouter = require('./routers/client/topicsRouter');

const {
  AuthError,
  ConflictError,
  WrongPasswordError,
  NotFoundError,
  NotNextTopicError,
} = require('./errors');

app.use('/courses', verifyJWT, coursesRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/topics', verifyJWT, topicsRouter);

app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof NotFoundError) res.status(404).send(error.message);
  else if (error instanceof WrongPasswordError) res.status(401).send(error.message);
  else if (error instanceof AuthError) res.status(401).send(error.message);
  else if (error instanceof NotNextTopicError) res.status(403).send(error.message);
  else if (error instanceof ConflictError) res.status(409).send(error.message);
  else res.status(500).json(error);
});

module.exports = app;
