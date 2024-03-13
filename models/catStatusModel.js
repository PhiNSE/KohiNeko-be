const mongoose = require('mongoose');

const { Schema } = mongoose;

const catStatusSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    catId: {
      type: Schema.Types.ObjectId,
      ref: 'cats',
      required: true,
    },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: 'statuses',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const CatStatus = mongoose.model('cat_statuses', catStatusSchema);

module.exports = CatStatus;
