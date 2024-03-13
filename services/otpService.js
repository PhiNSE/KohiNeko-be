const OtpModel = require('../models/otpModel');

exports.createOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpData = new OtpModel({
    otp,
    email,
  });

  const savedOtp = await otpData.save();
  return savedOtp;
};

exports.findOtp = async (otp, email) => {
  const otpResult = await OtpModel.findOne({ otp, email });
  return otpResult;
};
