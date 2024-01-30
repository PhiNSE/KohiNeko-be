const mongoose = require('mongoose');
const { coffeeShopAddressSchema } = require('./coffeeShopAddressessModel');

const coffeeShopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      require: [true, 'Coffee shop require name'],
      unique: true,
    },
    address: coffeeShopAddressSchema,
    openTime: {
      type: [
        {
          day: {
            type: String,
            required: true,
          },
          openHour: {
            type: String,
            required: true,
          },
          closeHour: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },
    images: {
      type: [String],
      required: false,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: false,
        unique: true,
      },
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['available', 'unavailable'],
      default: 'available',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    items: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'items',
        },
      ],
      required: false,
    },
  },
  { timestamps: true },
);

const coffeeShop = mongoose.model('coffee_shops', coffeeShopSchema);

module.exports = coffeeShop;
