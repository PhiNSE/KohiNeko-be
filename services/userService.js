const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const constant = require('../utils/constant');
const { sendEmail } = require('../utils/email');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, res) => {
  const token = generateAccessToken(user);
  return token;
};

exports.findOne = (query) => User.findOne(query);

exports.findOneWithHashedToken = (resetToken) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  return user;
};

exports.checkDuplicate = async (user) => {
  const duplicateFields = [];

  const userWithSameUsernameOrEmailOrPhone = await User.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { phoneNumber: user.phoneNumber },
    ],
  });

  if (userWithSameUsernameOrEmailOrPhone) {
    if (user.username === userWithSameUsernameOrEmailOrPhone.username) {
      duplicateFields.push('username');
    }
    if (user.email === userWithSameUsernameOrEmailOrPhone.email) {
      duplicateFields.push('email');
    }
    if (user.phoneNumber === userWithSameUsernameOrEmailOrPhone.phoneNumber) {
      duplicateFields.push('phoneNumber');
    }
  }

  return duplicateFields;
};

exports.createUser = (user) => {
  if (
    user.role === constant.STAFF_ROLE ||
    user.role === constant.SHOP_MANAGER
  ) {
    if (!user.coffeeShopId) {
      throw new Error('Staff role should have a correct shopId');
    }
  } else {
    user.coffeeShopId = null;
  }
  return User.create(user);
};
exports.getAllUsers = () => User.find();

exports.login = async (username, password) => {
  const user = await User.findOne({ username }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    return null;
  }
  return user;
};

exports.generateAccessToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.forgotPassword = async (email, protocol, host) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${protocol}://${host}/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return null;
  }
  return resetToken;
};

exports.resetPassword = async (password, passwordConfirm, user) => {
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetTokenExpires = undefined;

  return user.save();
};

exports.updatePassword = async (
  user,
  password,
  passwordConfirm,
  passwordCurrent,
) => {
  const freshUser = await User.findById(user._id).select('+password');
  if (!freshUser) {
    return null;
  }
  if (!(await freshUser.comparePassword(passwordCurrent, freshUser.password))) {
    return null;
  }
  freshUser.password = password;
  freshUser.passwordConfirm = passwordConfirm;
  await freshUser.save();
  const token = createSendToken(freshUser, 200);
  return { token, user: freshUser };
};

exports.updateUser = (id, data) => {
  const filteredBody = filterObj(data, 'firstName', 'lastName');
  const freshUser = User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true,
  });
  return freshUser;
};

exports.getUserById = async (id) => User.findById(id);

exports.deleteUser = (id) => User.findByIdAndUpdate(id, { isDeleted: true });
