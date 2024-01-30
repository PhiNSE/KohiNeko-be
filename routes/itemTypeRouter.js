const express = require('express');

const itemRouter = express.Router();
const itemTypeController = require('../controllers/itemTypeController');

itemRouter
  .route('/')
  .post(itemTypeController.saveItemType)
  .get(itemTypeController.getAllItemTypes);

itemRouter
  .route('/:id')
  .get(itemTypeController.getItemTypeById)
  .delete(itemTypeController.deleteItemType)
  .patch(itemTypeController.updateItemType);

exports.path = '/itemTypes';
exports.router = itemRouter;
