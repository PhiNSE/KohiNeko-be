const express = require('express');

const itemRouter = express.Router();
const itemController = require('../controllers/itemController');

itemRouter
  .route('/')
  .get(itemController.getAllItems)
  .post(itemController.saveItem);

itemRouter
  .route('/:id')
  .get(itemController.getItemById)
  .delete(itemController.deleteItem)
  .patch(itemController.updateItem);

exports.path = '/items';
exports.router = itemRouter;
