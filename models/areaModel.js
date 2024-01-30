const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    coffeeShopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coffeeShops',
      required: true,
    },
    name: { type: String, required: true },
    image: [String],
    isChildAllowed: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const areaModel = mongoose.model('areas', areaSchema);

module.exports = areaModel;
