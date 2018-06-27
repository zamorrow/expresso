const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const ppJson = json => JSON.stringify(json, null, 2);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

export const validateMenuItem = (req,res,next) => {
  if(!req.body.menuItem.name ||
     !req.body.menuItem.description ||
     !req.body.menuItem.inventory ||
     !req.body.menuItem.price){
       res.sendStatus(400);
     }
  next();
};

export menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {
    $menuItemId : menuItemId}, (err, menuItem) => {
      if(err){
        next(err);
      }else if(menuItem){
        next();
      }else{
        res.sendStatus(404);
      }
    });
});

export menuItemsRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err,rows)=>{
    if(err){
      next(err);
    }else {
      res.status(200).send({menuItems: rows});
    }
  });
});

export menuItemsRouter.post('/',validateMenuItem, (req,res,next) => {
  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
               VALUES ($name, $description, $inventory, $price, $menu_id)`;
  const values = {$name : req.body.menuItem.name,
                  $description: req.body.menuItem.description,
                  $inventory: req.body.menuItem.inventory,
                  $price: req.body.menuItem.price,
                  $menu_id: req.params.menuId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
        if(err){
          next(err);
        }else{
          res.status(201).send({menuItem: menuItem});
        }
      });
    }
  });
});

export menuItemsRouter.put('/:menuItemId',validateMenuItem, (req,res,next) => {

  const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory,
               price = $price, menu_id = $menu_id WHERE id = $menuItemId`;
  const values = {$name : req.body.menuItem.name,
                  $description: req.body.menuItem.description,
                  $inventory: req.body.menuItem.inventory,
                  $price: req.body.menuItem.price,
                  $menu_id: req.params.menuId,
                  $menuItemId: req.params.menuItemId};
  db.run(sql, values, function (err){
    if(err){
      next(err);
    }else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
        if(err){
          next(err)
        }else{
          res.status(200).send({menuItem: menuItem});
        }
      });
    }
  });
});

export menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE id = $menuItemId`;
  const values = {$menuItemId : req.params.menuItemId};
  db.run(sql, values, function(err){
    if(err){
      next(err);
    }else {
      res.sendStatus(204);
    }
  });
});
