require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const teste = require('./routers/teste');


app.use('/teste', teste);


module.exports = app;
