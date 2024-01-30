const router = require('express').Router();
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middlewares/authMiddleware');
const constants = require('../utils/constant');

router.get('/', statusController.getAllStatuses);
router.get('/:id', statusController.getStatusById);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constants.ADMIN_ROLE, constants.SHOP_MANAGER),
  statusController.createStatus,
);
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constants.ADMIN_ROLE, constants.SHOP_MANAGER),
  statusController.updateStatus,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constants.ADMIN_ROLE, constants.SHOP_MANAGER),
  statusController.deleteStatus,
);

exports.router = router;
