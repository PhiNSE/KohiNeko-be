const statusModel = require('../models/statusModel').Status;

exports.getAllStatuses = () => statusModel.find({ isDeleted: false });

exports.getStatusById = (id) =>
  statusModel.findOne({ _id: id, isDeleted: false });

exports.createStatus = (status) => statusModel.create(status);

exports.updateStatus = (id, status) =>
  statusModel.findByIdAndUpdate(id, status, { new: true });

exports.deleteStatus = (id) =>
  statusModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
