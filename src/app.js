/* eslint-disable no-unused-vars */
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const usersRouter = require('./routers/usersRouter');

app.use('/users', usersRouter);

app.use((error, req, res, next) => {
	console.error(error);
	res.status(500).json(error);
});

module.exports = app;
