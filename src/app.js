require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const { verifyJWT } = require('./midllewares/validation');
const coursesRouter = require('./routers/coursesRouter');
const adminRouter = require('./routers/admin/adminRouter');

app.use('/courses', coursesRouter);
app.use('/admin', verifyJWT, adminRouter);

module.exports = app;
