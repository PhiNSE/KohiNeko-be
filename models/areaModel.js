const mongoose = require('mongoose');
const { ImageSchema } = require('./imageModel');

const areaSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    coffeeShopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coffee_shops',
      required: true,
    },
    name: { type: String, required: true },
    images: {
      type: [ImageSchema],
      required: false,
    },
    areaCats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'area_cats',
      },
    ],
    areaStaffs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'area_staffs',
      },
    ],
    isChildAllowed: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const areaModel = mongoose.model('areas', areaSchema);

module.exports = areaModel;
