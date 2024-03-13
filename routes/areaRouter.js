const router = require('express').Router();
const areaController = require('../controllers/areaController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/coffeeShops/:coffeeShopId/areas', areaController.getAllAreas);
router.get('/coffeeShops/:id/areas/:areaId', areaController.getAreaById);
router.post(
  '/coffeeShops/:id/areas/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaController.createArea,
);
router.patch(
  '/coffeeShops/:id/areas/:areaId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  areaController.updateArea,
);
router.delete(
  '/coffeeShops/:id/areas/:areaId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  areaController.deleteArea,
);
router.post(
  '/coffeeShops/:id/areas/:areaId/image',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  areaController.addImage,
);
router.delete(
  '/coffeeShops/:id/areas/:areaId/image/:imageId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  areaController.deleteImage,
);

router.get(
  '/coffeeShops/:id/areas/:areaId/tableTypes',
  areaController.getTableTypeInArea,
);

router.get('/areas/:areaId/tableTypes', areaController.getTableTypeInArea);

exports.router = router;
