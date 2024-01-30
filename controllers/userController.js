const userService = require('../services/userService');
// const errorController = require('./errorController');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');

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
        res.status(404).send('User not found');
      } else {
        res.status(200).send({ status: 200, resetToken: resetToken });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

exports.checkDuplicate = async (req, res, next) => {
  const duplicateFields = await userService.checkDuplicate(req.body);
  if (duplicateFields.length > 0) {
    res.status(429).send({
      staus: 429,
      data: {
        duplicateFields: duplicateFields,
      },
    });
  } else {
    next();
  }
};

exports.createUser = catchAsync(async (req, res, next) => {
  const user = req.body;
  const newUser = await userService.createUser(user);
  const accessToken = userService.generateAccessToken(newUser._id);
  res.status(201).json({
    status: 201,
    accessToken: accessToken,
    data: {
      user: newUser,
    },
  });
});

exports.logout = (req, res, next) => {
  res.status(200).send({ status: 200, accessToken: null });
};

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send('Invalid user');
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
  userService
    .getAllUsers()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

exports.updatePassword = (req, res) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;
  userService
    .updatePassword(req.user, password, passwordConfirm, passwordCurrent)
    .then(({ token, user }) => {
      if (!user) {
        res.status(404).send('User not found');
      } else {
        res.status(200).send({
          status: 200,
          accessToken: token,
          data: {
            user: user,
          },
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal server error');
    });
};

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  if (!id) {
    res.status(400).send('Invalid user');
  }
  if (data.password || data.passwordConfirm) {
    res
      .status(400)
      .send({ status: 400, message: 'This route is not for password update' });
  }
  const updatedUser = userService.updateUser(id, data);
  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }
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
