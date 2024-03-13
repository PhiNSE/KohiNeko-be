const router = require('express').Router();
const catController = require('../controllers/catController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/cats', catController.getAllCats);
router.get('/coffeeShops/:id/cats', catController.getAllCatsByCoffeeShopId);
router.get('/coffeeShops/:id/cats/search', catController.searchCat);
router.get('/coffeeShops/:id/areas/:areaId/cats', catController.getCatByAreaId);
router.get('/coffeeShops/:id/cats/:catId', catController.getCatById);
router.post(
  '/coffeeShops/:id/cats',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  catController.createCat,
);

router.patch(
  '/coffeeShops/:id/cats/:catId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  catController.updateCat,
);
router.delete(
  '/coffeeShops/:id/cats/:catId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  catController.deleteCat,
);

router.post(
  '/coffeeShops/:id/cats/:catId/images',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  catController.addImages,
);

router.delete(
  '/coffeeShops/:id/cats/:catId/images/:imageId',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  authMiddleware.isShopOwner,
  catController.deleteImage,
);

exports.path = '/cats';
exports.router = router;
