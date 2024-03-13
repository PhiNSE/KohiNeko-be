const express = require('express');

const coffeeShopRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');
const coffeeShopController = require('../controllers/coffeeShopController');
const bookingRouter = require('./bookingRouter');
const itemRouter = require('./itemRouter');
const userController = require('../controllers/userController');

coffeeShopRouter
  .route('/')
  .get(coffeeShopController.getAllCoffeeShops)
  .post(authMiddleware.verifyToken, coffeeShopController.saveCoffeeShop);
coffeeShopRouter
  .route('/my')
  .get(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(
      constant.SHOP_MANAGER,
      constant.ADMIN_ROLE,
      constant.STAFF_ROLE,
    ),
    coffeeShopController.getCoffeeShopByUserId,
  );
coffeeShopRouter.get('/:id/staffs/search', userController.searchStaffsByShopId);
coffeeShopRouter.get('/:id/staffs', userController.getAllStaffsByShopId);
coffeeShopRouter.post(
  '/:id/staffs',
  authMiddleware.verifyToken,
  userController.createStaff,
);
coffeeShopRouter
  .route('/:id/approval')
  .patch(coffeeShopController.approveCoffeeShop);
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
coffeeShopRouter
  .route('/:id/openAndCloseTime')
  .post(coffeeShopController.getCoffeeShopOpenTimeAndCloseTime);
coffeeShopRouter
  .route('/:id/images')
  .all(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
    // authMiddleware.isShopOwner,
  )
  .post(coffeeShopController.addImage)
  .delete(coffeeShopController.deleteImages);

coffeeShopRouter
  .route('/total/count')
  .get(coffeeShopController.getTotalsCoffeeShops);

coffeeShopRouter.get(
  '/total/active',
  coffeeShopController.getAllActiveCoffeeShops,
);

coffeeShopRouter.use('/:coffeeShopId/bookings', bookingRouter.router);

coffeeShopRouter.use('/:coffeeShopId/items', itemRouter.router);

exports.path = '/coffeeShops';
exports.router = coffeeShopRouter;
