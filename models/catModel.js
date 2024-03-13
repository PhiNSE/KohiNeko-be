const mongoose = require('mongoose');
const { ImageSchema } = require('./imageModel');

const catSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      auto: true,
    },
    coffeeShopId: {
      type: mongoose.Schema.ObjectId,
      ref: 'coffee_shops',
      required: [true, 'cat required a coffeeShop'],
    },
    areaCats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'area_cats',
      },
    ],
    status: {
      type: String,
      default: 'active',
      enum: {
        values: ['active', 'inactive', 'sleeping', 'sick'],
        message: 'Status is either: active, inactive, sleeping, sick',
      },
    },
    // catStatus: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'cat_statuses',
    //   },
    // ],
    name: {
      type: String,
      required: [true, 'cat required a name'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'cat required a dateOfBirth'],
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: 'Date of birth must be in the past',
      },
    },
    gender: {
      type: String,
      default: 'unknown',
    },
    breed: {
      type: String,
      required: [true, 'cat required a breed'],
    },
    description: {
      type: String,
    },
    favorite: {
      type: String,
    },
    images: {
      type: [ImageSchema],
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const catModel = mongoose.model('cats', catSchema);

module.exports = catModel;
