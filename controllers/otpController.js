const OptSevice = require('../services/otpService');
const userService = require('../services/userService');
const ApiResponse = require('../dto/ApiResponse');
const catchAsync = require('../utils/catchAsync/catchAsync');
const AppError = require('../utils/appError');
const mail = require('../utils/email');

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (user) {
    return next(new AppError('Email is already exist', 400));
  }
  const otp = await OptSevice.createOTP(email);
  if (!otp) {
    return next(new AppError('Send otp failed', 400));
  }
  const imgUrl =
    'https://firebasestorage.googleapis.com/v0/b/kohineko-7d678.appspot.com/o/web-static%2FKohi%20Neko%20(3).png?alt=media&token=da0fd3b4-12d2-459b-acc4-7960bf41f59b';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <h1 style="color: #6B240C; font-size: 24px;">Welcome to Our Cat Coffee Platform!</h1>
      <div style="background-color: #f0f0f0; padding: 10px; display: inline-block; border-radius: 10px;">
  <img src="${imgUrl}" alt="coffee shop image" style="width: 200px; border-radius: 10px;" />
</div>
      <p style="font-size: 18px; color: #333;">Thank you for signing up. We're excited to have you join our community!</p>
      <h2 style="color: #6B240C; font-size: 20px;">Your OTP:</h2>
      <div style="display: inline-block; border: 2px solid #6B240C; padding: 10px; background-color: #f97316; color: white; border-radius: 10px; font-size: 20px; font-weight: bold;">${otp.otp}</div>
      <p style="font-size: 18px; color: #333;">Please use this OTP to complete your sign up process.</p>
      <p style="font-size: 16px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  const option = {
    email: email,
    subject: 'OTP',
    html: htmlContent,
  };

  await mail.sendEmail(option);
  res.send(ApiResponse.success('Send otp successfully', null));
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const otpResult = await OptSevice.findOtp(otp, email);
  if (!otpResult) {
    return next(new AppError('OTP is not correct', 400));
  }
  if (new Date(otpResult.expiredAt).getTime() < new Date().getTime()) {
    return next(new AppError('OTP is expired', 400));
  }
  res.send(ApiResponse.success('Verify otp successfully', otpResult));
});
