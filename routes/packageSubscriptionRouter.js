const router = require('express').Router();
const packageSubscriptionController = require('../controllers/packageSubscriptionController');
const constant = require('../utils/constant');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', packageSubscriptionController.getAllPackageSubscriptions);
router.get(
  '/coffeeShop/current',
  authMiddleware.verifyToken,
  packageSubscriptionController.getCurrentPackageSubscriptionByCoffeeShopId,
);
router.get(
  '/coffeeShop',
  authMiddleware.verifyToken,
  packageSubscriptionController.getAllPackageSubscriptionsByCoffeeShopId,
);
router.get('/:id', packageSubscriptionController.getPackageSubscriptionById);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageSubscriptionController.createPackageSubscription,
);
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageSubscriptionController.updatePackageSubscription,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageSubscriptionController.deletePackageSubscription,
);

exports.router = router;
