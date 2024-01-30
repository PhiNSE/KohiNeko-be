const router = require('express').Router();
const catController = require('../controllers/catController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/', catController.getAllCats);
router.get('/search', catController.searchCat);
router.get('/:id', catController.getCatById);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  catController.createCat,
);

router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  catController.updateCat,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  catController.deleteCat,
);

router.post(
  '/:id/image',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  catController.addImage,
);

exports.path = '/cats';
exports.router = router;
