const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const User = require('../models/userModel');
const constant = require('../utils/constant');
const { sendEmail } = require('../utils/email');
const AppError = require('../utils/appError');
const coffeeShopService = require('./coffeeShopService');
const { frontendURL } = require('../utils/appConstant');

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach((el) => {
//     if (allowedFields.includes(el)) {
//       newObj[el] = obj[el];
//     }
//   });
//   return newObj;
// };

dotenv.config({ path: './config.env' });
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
      { username: { $regex: new RegExp(`^${user.username}$`, 'i') } },
      { email: { $regex: new RegExp(`^${user.email}$`, 'i') } },
      { phoneNumber: user.phoneNumber }, // assuming phone number is not case-sensitive
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
  if (user.role === constant.STAFF_ROLE) {
    if (!user.coffeeShopId) {
      throw new Error('Manager/Staff should have a correct shopId');
    }
  } else {
    user.coffeeShopId = null;
  }
  return User.create(user);
};
exports.getAllUsers = (role, name, email, phoneNumber) =>
  User.find({
    $and: [
      { role: { $regex: role || '', $options: 'i' } },
      {
        $or: [
          { firstName: { $regex: name || '', $options: 'i' } },
          { lastName: { $regex: name || '', $options: 'i' } },
        ],
      },
      { email: { $regex: email || '', $options: 'i' } },
      { phoneNumber: { $regex: phoneNumber || '', $options: 'i' } },
    ],
  });

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
  console.log(protocol, host);
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const imgUrl =
    'https://firebasestorage.googleapis.com/v0/b/kohineko-7d678.appspot.com/o/web-static%2FKohi%20Neko%20(3).png?alt=media&token=da0fd3b4-12d2-459b-acc4-7960bf41f59b';

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const port = process.env.FE_PORT || 'http://localhost:5173';
  const resetURL = `${port}/reset-password/${resetToken}`;
  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  // // const htmlContent = `
  // //     <h1 style="color: #6B240C; font-size: 24px;">Forgot your password?</h1>

  // //     <img src="${imgUrl}" alt="coffee shop image" style="width: 200px;" />
  // //     <h1 style="color: #6B240C; font-size: 20px;">Submit a PATCH request with your new password and passwordConfirm to:</h1>
  // //     <h1 style="color: #6B240C; font-size: 20px;">Password: ${hashPassword}</h1>
  // //     <p style="color: #F5CCA0; font-size: 16px;">Please click the button below to join as staff.</p>
  // //     <a href="${frontendURL}/login" style="background-color: #994D1C; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Join Shop</a>
  // //   `;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <h1 style="color: #6B240C; font-size: 24px;">Forgot your password?</h1>
      <div style="background-color: #f0f0f0; padding: 10px; display: inline-block; border-radius: 10px;">
  <img src="${imgUrl}" alt="coffee shop image" style="width: 200px; border-radius: 10px;" />
</div>
      <p style="font-size: 18px; color: #333;">Submit a PATCH request with your new password and passwordConfirm to:</p>
      <h2 style="color: #6B240C; font-size: 20px;">Your Link:</h2>
      <a href="${resetURL}" style="display: inline-block; border: 2px solid #6B240C; padding: 10px; background-color: #f97316; color: white; border-radius: 10px; font-size: 20px; font-weight: bold; text-decoration: none;">${resetURL}</a>  <p style="font-size: 18px; color: #333;">Please use this link to reset your password.</p>
      <p style="font-size: 16px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      html: htmlContent,
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

exports.updateUser = async (id, data) => {
  // const filteredBody = filterObj(data, 'firstName', 'lastName', 'wallet');
  // console.log(filteredBody);
  const freshUser = await User.findByIdAndUpdate({ _id: id }, data, {
    new: true,
    runValidators: true,
  });
  return freshUser;
};

exports.updateUserProfile = async (id, data) => {
  try {
    const freshUser = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      data,
      {
        new: true,
        runValidators: true,
      },
    );
    return freshUser;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const message = `Duplicate field error: ${duplicateField}`;
      throw new AppError(message, 400);
    }
    throw new AppError(error.message, 400);
  }
};

exports.getUserById = (id) => User.findById(id);

exports.deleteUser = (id) => User.findByIdAndUpdate(id, { isDeleted: true });

//manager
exports.getAllManagers = () => User.find({ role: constant.SHOP_MANAGER });
exports.getManagerByShopId = (shopId) =>
  User.findOne({ role: constant.SHOP_MANAGER, coffeeShopId: shopId });

//staff
exports.getAllStaffs = () => User.find({ role: 'staff' });
exports.getAllStaffsByShopId = (shopId) =>
  User.find({ role: constant.STAFF_ROLE, coffeeShopId: shopId }).populate({
    path: 'areaStaffs',
    populate: { path: 'areaId' },
  });
exports.searchStaffsByShopId = (
  shopId,
  firstName,
  lastName,
  email,
  phoneNumber,
) =>
  User.find({
    $and: [
      { role: constant.STAFF_ROLE },
      { coffeeShopId: shopId },
      {
        $and: [
          { firstName: { $regex: firstName || '', $options: 'i' } },
          { lastName: { $regex: lastName || '', $options: 'i' } },
          { email: { $regex: email || '', $options: 'i' } },
          { phoneNumber: { $regex: phoneNumber || '', $options: 'i' } },
        ],
      },
    ],
  }).populate({
    path: 'areaStaffs',
    populate: { path: 'areaId' },
  });

exports.managerInviteStaff = async (
  managerId,
  email,
  username,
  hashPassword,
) => {
  const manager = await User.findById(managerId);
  if (!manager) {
    throw new AppError('Manager not found', 400);
  }
  const coffeeShop = await coffeeShopService.getCoffeeShopById(
    manager.coffeeShopId,
  );
  if (!coffeeShop) {
    throw new AppError('Coffee shop not found', 400);
  }
  const imgUrl =
    'https://firebasestorage.googleapis.com/v0/b/kohineko-7d678.appspot.com/o/web-static%2FKohi%20Neko%20(3).png?alt=media&token=da0fd3b4-12d2-459b-acc4-7960bf41f59b';
  const htmlContent = `
      <h1 style="color: #6B240C; font-size: 24px;">Manager ${
        manager.firstName
      } invite you to his/her cat coffee shop</h1>
      <h1 style="color: #6B240C; font-size: 20px;">Shop name: ${
        coffeeShop.shopName || ''
      }</h1>
      <img src="${imgUrl}" alt="coffee shop image" style="width: 200px;" />
      <h1 style="color: #6B240C; font-size: 20px;">User name:${username}</h1>
      <h1 style="color: #6B240C; font-size: 20px;">Password: ${hashPassword}</h1>
      <p style="color: #F5CCA0; font-size: 16px;">Please click the button below to join as staff.</p>
      <a href="${frontendURL}/login" style="background-color: #994D1C; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Join Shop</a>
    `;
  console.log('htmlContent', htmlContent);
  try {
    const result = await sendEmail({
      email: email,
      subject: `Manager ${manager.firstName} invite you to join shop: ${coffeeShop.shopName}`,
      html: htmlContent,
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new AppError(`Send email failed due to :${error}`, 200);
  }
};

exports.getUserWallet = async (userId) => {
  const users = await User.findOne({ _id: userId }, 'wallet');
  return users;
};

exports.getUserByEmail = async (email) => {
  const user = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') },
  });
  return user;
};
