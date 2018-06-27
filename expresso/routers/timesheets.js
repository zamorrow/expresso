const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const ppJson = json => JSON.stringify(json, null, 2);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

export const validateTimesheet = (req,res,next) => {
  if(!req.body.timesheet.hours ||
     !req.body.timesheet.rate ||
     !req.body.timesheet.date){
       res.sendStatus(400);
     }
  next();
};

export timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {
    $timesheetId : timesheetId}, (err, timesheet) => {
      if(err){
        next(err);
      }else if(timesheet){
        next();
      }else{
        res.sendStatus(404);
      }
    });
});

export timesheetsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err,rows)=>{
    if(err){
      next(err);
    }else {
      res.status(200).send({timesheets: rows});
    }
  });
});

export timesheetsRouter.post('/',validateTimesheet, (req,res,next) => {
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id ) VALUES ($hours, $rate, $date, $employee_id)';
  const values = {$hours : req.body.timesheet.hours,
                  $rate: req.body.timesheet.rate,
                  $date: req.body.timesheet.date,
                  $employee_id: req.params.employeeId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
        if(err){
          next(err);
        }else{
          res.status(201).send({timesheet: timesheet});
        }
      });
    }
  });
});

export timesheetsRouter.put('/:timesheetId',validateTimesheet, (req,res,next) => {

  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date,
               employee_id = $employee_id WHERE id = $timesheetId`;
  const values = {$hours : req.body.timesheet.hours,
                  $rate : req.body.timesheet.rate,
                  $date : req.body.timesheet.date,
                  $employee_id : req.params.employeeId,
                  $timesheetId : req.params.timesheetId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) => {
        if(err){
          next(err)
        }else{
          res.status(200).send({timesheet: timesheet});
        }
      });
    }
  });
});

export timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE id = $timesheetId`;
  const values = {$timesheetId : req.params.timesheetId};
  db.run(sql, values, function(err){
    if(err){
      next(err);
    }else {
      res.sendStatus(204);
    }
  });
});
