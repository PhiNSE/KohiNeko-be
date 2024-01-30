const express = require('express');

const coffeeShopRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');
const coffeeShopController = require('../controllers/coffeeShopController');

coffeeShopRouter
  .route('/')
  .get(coffeeShopController.getAllCoffeeShops)
  .post(coffeeShopController.saveCoffeeShop);
coffeeShopRouter
  .route('/:id')
  .get(coffeeShopController.getCoffeeShopById)
  .delete(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
    coffeeShopController.deleteCoffeeShopById,
  )
  .patch(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
    coffeeShopController.updateCoffeeShopById,
  );

exports.path = '/coffeeShops';
exports.router = coffeeShopRouter;
