const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Constant = require('../utils/constant');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      auto: true,
    },
    coffeeShopId: {
      type: mongoose.Schema.Types.ObjectId,
      require: false,
      ref: 'coffee_shops',
    },
    role: {
      type: String,
      default: 'customer',
      required: [true, 'An user must have a role'],
      enum: {
        values: [
          Constant.STAFF_ROLE,
          Constant.CUSTOMER_ROLE,
          Constant.ADMIN_ROLE,
          Constant.SHOP_MANAGER,
        ],
        message: 'Role is either: customer, staff, shop_manager, admin',
      },
    },
    gender: {
      type: String,
      required: [true, 'An user must have a gender'],
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender is either: male, female, other',
      },
    },
    firstName: {
      type: String,
      required: [true, 'An user must have a first name'],
      unique: false,
    },
    lastName: {
      type: String,
      required: [true, 'An user must have a last name'],
      unique: false,
    },
    username: {
      type: String,
      minlength: 6,
      required: [true, 'An user must have a username'],
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: [true, 'An user must have a password'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'An user must have a phone'],
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      min: '1900-01-01',
      max: [new Date(), 'Date of birth must be less than today'],
      required: [true, 'An user must have a dateOfBirth'],
    },
    email: {
      type: String,
      match: [
        /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please fill a valid email address',
      ],
      required: [true, 'An user must have a email'],
      unique: true,
    },
    avatar: {
      type: String,
      default:
        'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg',
    },
    status: {
      type: String,
      default: 'active',
      enum: {
        values: ['active', 'inactive'],
        message: 'Status is either: active, inactive',
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password are not the same',
      },
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    passwordChangedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.passwordConfirm = undefined;
  this.password = await bcrypt.hashSync(this.password, 10);
  this.passwordChangedAt = Date.now() - 1000;
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
