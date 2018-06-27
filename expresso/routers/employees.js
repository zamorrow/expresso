const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets.js');
const ppJson = json => JSON.stringify(json, null, 2);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

export const validateEmployee = (req,res,next) => {
  if(!req.body.employee.name ||
     !req.body.employee.position ||
     !req.body.employee.wage){
       res.sendStatus(400);
     }
  next();
};

export employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get('SELECT * FROM Employee WHERE id = $employeeId', {
    $employeeId : employeeId}, (err,employee) => {
      if(err){
        next(err);
      }else if(employee){
        req.employee = employee;
        next();
      }else{
        res.sendStatus(404);
      }
    });
});

export employeesRouter.use('/:employeeId/timesheets' , timesheetsRouter);

export employeesRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1 ", (err,rows)=>{
    if(err){
      next(err);
    }else {
      res.status(200).send({employees: rows});
    }
  });
});

export employeesRouter.post('/',validateEmployee, (req,res,next) => {

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)';
  const values = {$name : req.body.employee.name,
                  $position: req.body.employee.position,
                  $wage: req.body.employee.wage,
                  $is_current_employee: req.body.employee.is_current_employee || 1};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
        if(err){
          next(err)
        }else{
          res.status(201).send({employee: employee});
        }
      });
    }
  });
});

export employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee: req.employee});
});


export employeesRouter.put('/:employeeId',validateEmployee, (req,res,next) => {

  const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage,
               is_current_employee = $is_current_employee WHERE id = $id`;
  const values = {$name : req.body.employee.name,
                  $position : req.body.employee.position,
                  $wage : req.body.employee.wage,
                  $is_current_employee : req.body.employee.is_current_employee || 1,
                  $id : req.params.employeeId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        if(err){
          next(err)
        }else{
          res.status(200).send({employee: employee});
        }
      });
    }
  });
});

export employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $id`;
  const values = {$id : req.params.employeeId};

  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        if(err){
          next(err)
        }else{
          res.status(200).send({employee: employee});
        }
      });
    }
  });

});
