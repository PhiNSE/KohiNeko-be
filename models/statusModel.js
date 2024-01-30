const mongoose = require('mongoose');

const { Schema } = mongoose;

const statusSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    name: {
      type: String,
      required: [true, 'Status must have a name'],
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Status = mongoose.model('statuses', statusSchema);

exports.Status = Status;
