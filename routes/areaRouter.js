const router = require('express').Router();
const areaController = require('../controllers/areaController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/', areaController.getAllAreas);
router.get('/:id', areaController.getAreaById);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaController.createArea,
);
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaController.updateArea,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaController.deleteArea,
);
router.post(
  '/:id/image',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaController.addImage,
);

exports.router = router;
