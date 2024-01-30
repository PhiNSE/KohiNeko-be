const express = require('express');

const userRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

/* GET users listing. */

userRouter
  .route('/:id')
  .delete(
    authMiddleware.verifyToken,
    authMiddleware.checkUserPermission,
    userController.deleteUser,
  )
  .get(userController.getUserId)
  .patch(userController.updateUser);
userRouter
  .route('/change-password')
  .patch(authMiddleware.verifyToken, userController.updatePassword);
userRouter
  .route('')
  .get(
    authMiddleware.verifyToken,
    authMiddleware.restrictTo('customer', 'admin'),
    userController.getAllUsers,
  )
  .delete(authMiddleware.verifyToken, userController.deleteUserMe)
  .post(userController.checkDuplicate, userController.createUser);

module.exports = userRouter;
