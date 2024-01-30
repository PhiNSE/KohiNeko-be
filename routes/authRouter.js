const express = require('express');

const router = express.Router();
// const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/login', authController.login);
router.post('/signup', userController.createUser);
router.post('/logout', authController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:resetToken', userController.resetPassword);

exports.path = '/auth';
exports.router = router;
