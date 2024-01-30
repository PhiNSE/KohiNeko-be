const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const areaCatSchema = new Schema(
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
    catId: {
      type: Schema.Types.ObjectId,
      ref: 'cats',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now(),
      required: true,
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

const areaCatModel = Mongoose.model('area_cats', areaCatSchema);

exports.areaCatModel = areaCatModel;
