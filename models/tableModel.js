const mongoose = require('mongoose');

const { Schema } = mongoose;

const tableSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    areaId: {
      type: Schema.Types.ObjectId,
      ref: 'areas',
      required: true,
    },
    tableTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'table_types',
      required: true,
    },
    images: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Table = mongoose.model('tables', tableSchema);

exports.Table = Table;
