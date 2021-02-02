require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const usersRouter = require('./routers/users');

app.use('/users', usersRouter);

module.exports = app;