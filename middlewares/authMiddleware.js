const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync/catchAsync');
const tokenBlacklist = require('../models/tokenBlackListModel');
const AppError = require('../utils/appError');

dotenv.config({ path: './config.env' });

// const generateAccessToken = (user) =>
//   jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

// const createSendToken = (user, res) => {
//   const token = generateAccessToken(user);
//   res.cookie('jwt', token, {
//     httpOnly: true,
//     secure: true,
//     expires: new Date(
//       Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
//     ),
//   });
// };

exports.verifyToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt; // Get token from cookies
  if (!token) return next(new AppError('Please login to get access', 401));
  const isBlacklisted = await tokenBlacklist.find({ token });
  if (!isBlacklisted) {
    return next(
      new AppError('This token has been blacklisted. Please login again.', 401),
    );
  }
  const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const freshUser = await User.findById(decoded.userId);
  if (!freshUser) {
    return next(new AppError('User not found', 404));
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }
    next();
  };

//Function to check own id
exports.checkUserPermission = (req, res, next) => {
  const userMakingRequest = req.user.id; // Assuming req.user is set in a previous middleware
  const userToBeDeleted = req.params.id;

  if (userMakingRequest !== userToBeDeleted && req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'You do not have permission to perform this action.' });
  }
  next();
};
