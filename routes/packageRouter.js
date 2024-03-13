const router = require('express').Router();

const packageController = require('../controllers/packageController');
const authMiddleWare = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.post(
  '/',
  authMiddleWare.verifyToken,
  authMiddleWare.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageController.createPackage,
);
router.patch(
  '/:id',
  authMiddleWare.verifyToken,
  authMiddleWare.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageController.updatePackage,
);
router.delete(
  '/:id',
  authMiddleWare.verifyToken,
  authMiddleWare.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  packageController.deletePackage,
);
router.post(
  '/:packageId/vnPay',
  authMiddleWare.verifyToken,
  authMiddleWare.restrictTo(constant.SHOP_MANAGER),
  packageController.createPaymentUrl,
);

router.post(
  '/:packageId/vnPay/return',
  authMiddleWare.verifyToken,
  authMiddleWare.restrictTo(constant.SHOP_MANAGER),
  packageController.vnpay_return,
);

exports.router = router;
