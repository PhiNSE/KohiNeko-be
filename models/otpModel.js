const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  expiredAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 1,
  },
});

const otpModel = mongoose.model('otp', otpSchema);

module.exports = otpModel;
