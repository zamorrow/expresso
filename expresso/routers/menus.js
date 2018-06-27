const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems.js');
const ppJson = json => JSON.stringify(json, null, 2);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateMenu = (req,res,next) => {
  if(!req.body.menu.title){
       res.sendStatus(400);
     }
  next();
};

export menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get('SELECT * FROM Menu WHERE id = $menuId', {
    $menuId : menuId}, (err, menu) => {
      if(err){
        next(err);
      }else if(menu){
        req.menu = menu;
        next();
      }else{
        res.sendStatus(404);
      }
    });
});

export menusRouter.use('/:menuId/menu-items' , menuItemsRouter);

export menusRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, rows)=>{
    if(err){
      next(err);
    }else {
      res.status(200).send({menus: rows});
    }
  });
});

export menusRouter.post('/',validateMenu, (req,res,next) => {

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {$title : req.body.menu.title};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
        if(err){
          next(err)
        }else{
          res.status(201).send({menu: menu});
        }
      });
    }
  });
});

export menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu: req.menu});
});

export menusRouter.put('/:menuId',validateMenu, (req,res,next) => {

  const sql = `UPDATE Menu SET title = $title WHERE id = $id`;
  const values = {$title : req.body.menu.title,
                  $id : req.params.menuId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
        if(err){
          next(err)
        }else{
          res.status(200).send({menu: menu});
        }
      });
    }
  });
});

export menusRouter.delete('/:menuId', (req,res,next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, row)=>{
          if(err){
            next(err);
          }else if(!row){
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, function(err){
                if(err){
                    next(err);
                }else{
                  res.status(204).send();
                }
              });
          }else{
            res.status(400).send();
          }
      });
});
