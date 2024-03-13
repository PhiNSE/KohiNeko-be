const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const areaStaffSchema = new Schema(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now(),
    },
    endTime: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const areaStaffModel = Mongoose.model('area_staffs', areaStaffSchema);

exports.areaStaffModel = areaStaffModel;
exports.areaStaffSchema = areaStaffSchema;
