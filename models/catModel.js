const mongoose = require('mongoose');

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
    areaCats: {
      type: mongoose.Schema.ObjectId,
      ref: 'area_cats',
    },
    name: {
      type: String,
      required: [true, 'cat required a name'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'cat required a dateOfBirth'],
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
      type: [String],
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
