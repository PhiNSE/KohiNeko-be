const router = require('express').Router();
const areaStaffController = require('../controllers/areaStaffController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get(
  '/areaStaffs/catSameArea',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.STAFF_ROLE),
  areaStaffController.getCatsSameArea,
);
router.get('/areaStaffs', areaStaffController.getAllAreaStaffs);
router.get(
  '/coffeeShops/:id/areas/:areaId/staffs',
  areaStaffController.getStaffByAreaId,
);
router.get('/areaStaffs/search', areaStaffController.searchAreaStaff);
router.post(
  '/areaStaffs/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaStaffController.createAreaStaff,
);
router.patch(
  '/areaStaffs/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaStaffController.updateAreaStaff,
);
router.delete(
  '/areaStaffs/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(constant.ADMIN_ROLE, constant.SHOP_MANAGER),
  areaStaffController.deleteAreaStaff,
);

exports.path = '/areaStaffs';
exports.router = router;
