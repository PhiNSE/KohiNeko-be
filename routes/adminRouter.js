const router = require('express').Router();

const coffeeShopController = require('../controllers/coffeeShopController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router
  .route('/coffeeShops')
  .all(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(constant.ADMIN_ROLE),
  )
  .get(coffeeShopController.getAllCoffeeShopsByAdmin);
//   .patch(coffeeShopController.updateCoffeeShopByAdmin);

router
  .route('/coffeeShops/:id')
  .all(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo(constant.ADMIN_ROLE),
  )
  .patch(coffeeShopController.approveCoffeeShop);
//   .delete(coffeeShopController.deleteCoffeeShopByAdmin)
//   .patch(coffeeShopController.updateCoffeeShopByAdmin);

module.exports = router;
