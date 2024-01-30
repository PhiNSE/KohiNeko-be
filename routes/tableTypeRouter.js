const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');
const tableTypeController = require('../controllers/tableTypeController');

router.get('/', tableTypeController.getAllTableTypes);
router.get('/:id', tableTypeController.getTableTypeById);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  tableTypeController.createTableType,
);
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  tableTypeController.updateTableType,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  tableTypeController.deleteTableType,
);
router.get(
  '/numberOfPeople/:numberOfPeople',
  tableTypeController.getTableTypeByNumberOfPeople,
);

exports.router = router;
