const router = require('express').Router();
const areaCatController = require('../controllers/areaCatController');
const authMiddleware = require('../middlewares/authMiddleware');
const constant = require('../utils/constant');

router.get('/', areaCatController.getAllAreaCats);
router.get('/search', areaCatController.searchAreaCats);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constant.ADMIN_ROLE,
    constant.SHOP_MANAGER,
    constant.STAFF_ROLE,
  ),
  areaCatController.createAreaCat,
);
router.patch(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constant.ADMIN_ROLE,
    constant.SHOP_MANAGER,
    constant.STAFF_ROLE,
  ),
  areaCatController.updateAreaCat,
);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo(
    constant.ADMIN_ROLE,
    constant.SHOP_MANAGER,
    constant.STAFF_ROLE,
  ),
  areaCatController.deleteAreaCat,
);

exports.router = router;
