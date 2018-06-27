const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');

const apiRouter = require('./routers/api.js');

const PORT = process.env.port || 4000;
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, () => { console.log(`Server is listening on PORT ${PORT}`)});

module.exports = app;
