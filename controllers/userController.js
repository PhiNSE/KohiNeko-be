const crypto = require('crypto');

const constant = require('../utils/constant');
const userService = require('../services/userService');
// const errorController = require('./errorController');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const coffeeShopService = require('../services/coffeeShopService');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.age) {
    next(new AppError('Invalid user', 400));
  } else {
    next();
  }
};

exports.getUserId = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    next(new AppError('ID is required', 400));
  }
  const freshUser = await userService.getUserById(req.params.id);
  if (!freshUser) {
    return next(new AppError('User not found', 404));
  }
  return res
    .status(200)
    .send(ApiResponse.success('Get user successfully', freshUser));
});

exports.getCurrentUser = async (req, res) => {
  const user = await userService.findOne({ _id: req.user._id });
  res
    .status(200)
    .send(ApiResponse.success('Get current user successfully', user));
};
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password, passwordConfirm } = req.body;

  const userResetPassword =
    await userService.findOneWithHashedToken(resetToken);

  if (!userResetPassword) {
    return next(new AppError('Invalid token', 400));
  }
  const user = await userService.resetPassword(
    password,
    passwordConfirm,
    userResetPassword,
  );

  res
    .status(200)
    .send(ApiResponse.success('Reset password successfully', user));
});

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  userService
    .forgotPassword(email, req.protocol, req.get('host'))
    .then((resetToken) => {
      if (!resetToken) {
        res.status(404).send(ApiResponse.error('User not found'));
      } else {
        res.status(200).send({ status: 200, resetToken: resetToken });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(ApiResponse.error('Internal server error'));
    });
};

exports.checkDuplicate = async (req, res, next) => {
  const duplicateFields = await userService.checkDuplicate(req.body);
  if (duplicateFields.length > 0) {
    res.send(ApiResponse.error('Duplicate fields', duplicateFields));
  } else {
    next();
  }
};

exports.createUser = catchAsync(async (req, res, next) => {
  const user = req.body;
  const newUser = await userService.createUser(user);
  const accessToken = userService.generateAccessToken(newUser._id);
  res.status(201).send(
    ApiResponse.success('Create user successfully', {
      user: newUser,
      accessToken: accessToken,
    }),
  );
});

exports.createStaff = catchAsync(async (req, res, next) => {
  const user = req.body;
  const shopId = req.params.id;
  const coffeeShop = await coffeeShopService.getCoffeeShopById(shopId);
  if (!coffeeShop) {
    return next(new AppError('Coffee shop not found', 404));
  }
  user.coffeeShopId = shopId;
  user.role = constant.STAFF_ROLE;
  const hashPassword = crypto.randomBytes(16).toString('hex');
  user.password = hashPassword;
  user.passwordConfirm = hashPassword;
  const newUser = await userService.createUser(user);
  await userService.managerInviteStaff(
    req.user._id,
    newUser.email,
    user.username,
    hashPassword,
  );
  res.status(201).send(
    ApiResponse.success('Create staff & send invite mail to  successfully', {
      user: newUser,
    }),
  );
});

exports.logout = (req, res, next) => {
  res
    .status(200)
    .send(ApiResponse.success('Logout successfully', { accessToken: null }));
};

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send(ApiResponse.error('Invalid user', null));
  }
  const user = await userService.login(username, password);
  if (!user) {
    return next(new AppError('Invalid username or password', 401));
  }
  const accessToken = userService.generateAccessToken(user);
  res.status(200).send(
    new ApiResponse(200, 'Login successfully', {
      accessToken: accessToken,
      user: user,
    }),
  );
});

exports.getAllUsers = (req, res) => {
  const { role, name, email, phoneNumber } = req.query;
  userService
    .getAllUsers(role, name, email, phoneNumber)
    .then((users) => {
      res.send(ApiResponse.success('Get all users successfully', users));
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(ApiResponse.error('Internal server error', null));
    });
};

exports.updatePassword = (req, res) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;
  userService
    .updatePassword(req.user, password, passwordConfirm, passwordCurrent)
    .then(({ token, user }) => {
      if (!user) {
        res.status(404).send(ApiResponse.error('User not found', null));
      } else {
        res.send(
          ApiResponse.success('Update password successfully', {
            user: user,
            accessToken: token,
          }),
        );
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(ApiResponse.error('Internal server error', null));
    });
};

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  if (!id) {
    res.status(400).send(ApiResponse.error('Invalid user', null));
  }
  if (data.password || data.passwordConfirm) {
    res.status(400).send({
      status: 400,
      message: 'This route is not for password update',
      data: null,
    });
  }
  const updatedUser = await userService.updateUserProfile(id, data);
  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }
  res
    .status(200)
    .json(ApiResponse.success('Update profile user successfully', updatedUser));
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedUser = await userService.deleteUser(id);
  if (!deletedUser) {
    return next(new AppError('User not found', 404));
  }
  res
    .status(204)
    .send(ApiResponse.success('Delete user successfully', deletedUser));
});

exports.deleteUserMe = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const deletedUser = await userService.deleteUser(id);
  if (!deletedUser) {
    return next(new AppError('User not found', 404));
  }
  res
    .status(204)
    .send(ApiResponse.success('Delete user successfully', deletedUser));
});

exports.getAllManagers = catchAsync((req, res, next) => {
  const managers = userService.getAllManagers();
  res
    .status(200)
    .send(ApiResponse.success('Get all managers successfully', managers));
});

exports.getManagerByShopId = catchAsync(async (req, res, next) => {
  const shopId = req.params.id;
  const manager = userService.getManagerByShopId(shopId);
  if (!manager) {
    return next(new AppError('Manager not found', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Get manager by shop id successfully', manager));
});

exports.getAllStaffs = catchAsync(async (req, res, next) => {
  const staffs = await userService.getAllStaffs();
  res
    .status(200)
    .send(ApiResponse.success('Get all staffs successfully', staffs));
});

exports.searchStaffsByShopId = catchAsync(async (req, res, next) => {
  const shopId = req.params.id;
  const { firstName, lastName, email, phoneNumber } = req.query;
  const staffs = await userService.searchStaffsByShopId(
    shopId,
    firstName,
    lastName,
    email,
    phoneNumber,
  );
  res
    .status(200)
    .send(ApiResponse.success('Search staffs by shop id successfully', staffs));
});

exports.getAllStaffsByShopId = catchAsync(async (req, res, next) => {
  const shopId = req.params.id;
  const staffs = await userService.getAllStaffsByShopId(shopId);
  res
    .status(200)
    .send(
      ApiResponse.success('Get all staffs by shop id successfully', staffs),
    );
});

exports.managerInviteStaff = catchAsync(async (req, res, next) => {
  const managerId = req.user._id;
  const { email } = req.body;
  await userService.managerInviteStaff(managerId, email);
  res
    .status(200)
    .send(
      ApiResponse.success('Manager send invite mail to staff successfully'),
    );
});

exports.getUserWallet = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const wallet = await userService.getUserWallet(userId);
  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Get user wallet successfully', wallet));
});

exports.isEmailExist = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email request body is required', 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .send(ApiResponse.error('Invalid email format', email));
  }
  const isEmailExist = await userService.getUserByEmail(email);
  if (isEmailExist) {
    return res
      .status(200)
      .send(ApiResponse.error('Email is existed', isEmailExist));
  }
  res
    .status(200)
    .send(ApiResponse.success('Email is not existed', isEmailExist));
});
