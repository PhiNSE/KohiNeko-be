const router = require('express').Router();

const catStatusController = require('../controllers/catStatusController');
const authMiddleware = require('../middlewares/authMiddleware');
const constants = require('../utils/constant');

router.get('/', catStatusController.getAllCatStatuses);

router.get('/:id', catStatusController.getCatStatusById);

router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constants.ADMIN_ROLE,
    constants.SHOP_MANAGER,
    constants.STAFF_ROLE,
  ),
  catStatusController.createCatStatus,
);

router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constants.ADMIN_ROLE,
    constants.SHOP_MANAGER,
    constants.STAFF_ROLE,
  ),
  catStatusController.updateCatStatus,
);

router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constants.ADMIN_ROLE,
    constants.SHOP_MANAGER,
    constants.STAFF_ROLE,
  ),
  catStatusController.deleteCatStatus,
);

exports.router = router;
