const mongoose = require('mongoose');

const { Schema } = mongoose;

const tableTypeSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    coffeeShopId: {
      type: Schema.Types.ObjectId,
      ref: 'coffee_shops',
      required: true,
    },
    tableIds: [{ type: Schema.Types.ObjectId, ref: 'tables' }],
    name: {
      type: String,
    },
    minNumberOfSeats: {
      type: Number,
      required: true,
    },
    maxNumberOfSeats: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
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

const TableType = mongoose.model('table_types', tableTypeSchema);

exports.TableType = TableType;
exports.TableTypeSchema = tableTypeSchema;
