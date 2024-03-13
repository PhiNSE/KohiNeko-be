const router = require('express').Router();
const uploadController = require('../controllers/uploadController');
// const authMiddleware = require('../middlewares/authMiddleware');
// const constants = require('../utils/constant');

//upload static images
router.post(
  '/',
  // authMiddleware.verifyToken,
  // authMiddleware.restrictTo(constants.ROLE_ADMIN),
  uploadController.uploadImage,
);

exports.router = router;
