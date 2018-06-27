const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees.js');
const menusRouter = require('./menus.js');

export apiRouter.use('/employees', employeesRouter);
export apiRouter.use('/menus', menusRouter);
