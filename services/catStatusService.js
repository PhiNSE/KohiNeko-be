const catStatusModel = require('../models/catStatusModel');

exports.getAllCatStatuses = () => catStatusModel.find({ isDeleted: false });

exports.getCatStatusById = (id) =>
  catStatusModel.findOne({ _id: id, isDeleted: false });

exports.createCatStatus = (catStatus) => catStatusModel.create(catStatus);

exports.updateCatStatus = (id, catStatus) =>
  catStatusModel.findByIdAndUpdate(id, catStatus, { new: true });

exports.deleteCatStatus = (id) =>
  catStatusModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
