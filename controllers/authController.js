const authService = require('../services/authService');
const tokenBlackListService = require('../services/tokenBlackListService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send('Invalid user');
  }
  const user = await authService.login(username, password);
  if (!user) {
    return next(new AppError('Invalid username or password', 401));
  }
  const accessToken = authService.generateAccessToken(user);

  // Set a cookie with the access token
  res.cookie('jwt', accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 90,
    httpOnly: true,
  });

  res.status(200).send(
    new ApiResponse(200, 'Login successfully', {
      user: user,
    }),
  );
});

exports.logout = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  await tokenBlackListService.saveToken(token);
  res
    .status(200)
    .cookie('jwt', '', { expires: new Date(0) })
    .send(new ApiResponse(200, 'Logout successfully', null));
});
