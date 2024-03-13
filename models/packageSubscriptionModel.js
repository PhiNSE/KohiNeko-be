const mongoose = require('mongoose');

const { Schema } = mongoose;

const packageSubscriptionSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'packages',
      required: true,
    },
    coffeeShopId: {
      type: Schema.Types.ObjectId,
      ref: 'coffeeShops',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const PackageSubscription = mongoose.model(
  'package_subscriptions',
  packageSubscriptionSchema,
);

module.exports = PackageSubscription;
