const mongoose = require('mongoose');

const coffeeShopAddressSchema = new mongoose.Schema(
  {
    houseNumber: {
      type: String,
      required: [true, 'Coffee shop require house number'],
    },
    street: {
      type: String,
      required: [true, 'Coffee shop require street'],
    },
    city: {
      type: String,
      required: [true, 'Coffee shop require city'],
    },
    district: {
      type: String,
      required: [true, 'Coffee shop require district'],
    },
    // postalCode: {
    //   type: String,
    //   required: [true, 'Coffee shop require postal code'],
    // },
    coordinates: {
      lat: {
        type: Number,
        // unique: true,
        // required: [true, 'Coffee shop require latitude'],
      },
      lng: {
        type: Number,
        // unique: true,
        // required: [true, 'Coffee shop require longitude'],
      },
    },
  },
  { timestamps: true },
);

module.exports = { coffeeShopAddressSchema };
