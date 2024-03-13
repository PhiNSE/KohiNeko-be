const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
const User = require('../models/userModel');

// const generateAccessToken = (user) =>
//   jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

// const createSendToken = (user, res) => {
//   const token = generateAccessToken(user);
//   return token;
// };

exports.generateAccessToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.login = async (username, password) => {
  const user = await User.findOne({ username })
    .select(
      '+password -refreshToken -passwordResetExpires -__v -createdAt -updatedAt -isDeleted -passwordResetToken -passwordResetTokenExpires -passwordChangedAt',
    )
    .populate('coffeeShopId');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return null;
  }

  user.password = undefined;

  return user;
};

exports.logout = async (username) => {
  const user = await User.findOne({ username });
  if (!user) {
    return null;
  }
  return user;
};

exports.refeshToken = (user) => {
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    },
  );
  return User.findOneAndUpdate(
    user._id,
    { refreshToken: refreshToken },
    { new: true },
  );
};
