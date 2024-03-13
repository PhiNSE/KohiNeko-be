const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const authService = require('../services/authService');
const tokenBlackListService = require('../services/tokenBlackListService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');
const tokenBlacklist = require('../models/tokenBlackListModel');
const User = require('../models/userModel');
const { frontendURL } = require('../utils/appConstant');

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

  const refeshToken = await authService.refeshToken(user);

  //Refresh refeshToken
  await tokenBlackListService.saveToken(refeshToken);

  // Set a cookie with the access token
  // res.cookie('jwt', accessToken, {
  //   maxAge: 1000 * 60 * 60 * 24 * 90,
  //   httpOnly: true,
  // });

  res.status(200).send(
    new ApiResponse(200, 'Login successfully', {
      accessToken: accessToken,
      user: user,
    }),
  );
});

exports.logout = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return next(new AppError('Please login to get access', 401));
  const decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  await tokenBlackListService.saveToken(user.refreshToken);
  await tokenBlackListService.saveToken(token);
  res.status(200).send(new ApiResponse(200, 'Logout successfully', null));
});

exports.verifyRefreshToken = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization; // Get token from cookies
  if (!token) return next(new AppError('Please login to get access', 401));
  token = token.replace('Bearer ', '');
  const isBlacklisted = await tokenBlacklist.find({ token });
  if (isBlacklisted.length > 0 && isBlacklisted[0]) {
    return next(
      new AppError('This token has been blacklisted. Please login again.', 401),
    );
  }
  let decoded;
  try {
    decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return next(new AppError('Error decoding token', 400));
  }
  const freshUser = await User.findById(decoded.userId);
  if (!freshUser) {
    return next(new AppError('User not found', 404));
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }

  try {
    jwt.verify(freshUser.refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(new AppError('Token expired, please login again', 401));
  }
  const accessToken = authService.generateAccessToken(freshUser);
  await tokenBlackListService.saveToken(token);
  res.status(200).send(
    new ApiResponse(200, 'Refresh token successfully', {
      accessToken: accessToken,
      user: freshUser,
    }),
  );
});

//oath2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${frontendURL}/login`,
      scope: ['email', 'profile'],
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log(profile.emails[0].value);
      const user = await User.findOne({
        email: profile.emails[0].value,
      });
      console.log(user, 'oauth');
      if (user) {
        cb(null, user);
      } else {
        cb(new AppError('Email not sign up', 200), null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

exports.googleLogin = catchAsync((req, res, next) => {
  req.session = null; // Clear the session cookie
  passport.authenticate('google', {
    session: 'false',
    scope: ['email', 'profile'],
  });
});

exports.googleLoginCallback = passport.authenticate('google', {
  failureRedirect: `${frontendURL}/login`,
  // successRedirect: `${frontendURL}`,
});

exports.googleLoginSuccess = catchAsync(async (req, res) => {
  if (req.user) {
    const accessToken = authService.generateAccessToken(req.user);
    const refeshToken = await authService.refeshToken(req.user);
    //Refresh refeshToken
    await tokenBlackListService.saveToken(refeshToken);
    res.status(200).json(
      new ApiResponse(200, 'Google login successfully', {
        accessToken: accessToken,
        user: req.user,
      }),
    );
  } else {
    res
      .status(200)
      .json(
        new ApiResponse(
          401,
          'Email has not been linked to any account! Please sign up',
          null,
        ),
      );
  }
});

exports.googleLoginFailure = (req, res) => {
  // Handle failure redirect in the client-side code
  res.status(401).json(new ApiResponse(401, 'Google login failed', null));
};
