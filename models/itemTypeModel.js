const mongoose = require('mongoose');

const itemTypeSchema = new mongoose.Schema(
  {
    itemTypeName: {
      type: String,
      required: [true, 'Item type must have a name'],
      unique: true,
    },
  },
  { timestamps: true },
);

const ItemType = mongoose.model('item_types', itemTypeSchema);

module.exports = { ItemType, itemTypeSchema };
