const express = require('express');

const router = express.Router();
// const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/signup', userController.createUser);
router.post('/logout', authController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:resetToken', userController.resetPassword);
router.post('/refresh-token', authController.verifyRefreshToken);
router
  .route('/current')
  .get(authMiddleware.verifyToken, userController.getCurrentUser);
router.post('/login/google', authController.googleLogin);
router.get(
  '/login/google/callback',
  authController.googleLoginCallback,
  authController.googleLoginSuccess,
);
router.get('/login/google/failure', authController.googleLoginFailure);
exports.path = '/auth';
exports.router = router;
