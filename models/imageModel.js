const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      auto: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

exports.ImageSchema = ImageSchema;
