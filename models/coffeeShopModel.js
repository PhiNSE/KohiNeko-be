const mongoose = require('mongoose');
const { coffeeShopAddressSchema } = require('./coffeeShopAddressessModel');
const { ImageSchema } = require('./imageModel');

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
            //   validate: {
            //     validator: function (value) {
            //       const open =
            //         Number.parseInt(this.openHour.slice(0, 1), 10) +
            //         Number.parseInt(this.openHour.slice(2, 3), 10) * 0.1;
            //       const close =
            //         Number.parseInt(value.slice(0, 1), 10) +
            //         Number.parseInt(value.slice(2, 3), 10) * 0.1;
            //       return close > open;
            //     },
            //     message: 'closeHour must be greater than openHour',
            //   },
          },
        },
      ],
      required: true,
    },
    images: {
      type: [ImageSchema],
      required: false,
    },
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
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'rejected'],
      default: 'unavailable',
    },
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'users',
    //   required: true,
    // },
    // staffs: {
    //   type: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'users',
    //     },
    //   ],
    //   required: false,
    // },
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
