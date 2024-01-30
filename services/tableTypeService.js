const tableTypeModel = require('../models/tableTypeModel').TableType;

exports.getAllTableTypes = () =>
  tableTypeModel.find({ isDeleted: false }).populate('tableIds');

exports.getTableTypeById = (id) =>
  tableTypeModel
    .findOne({ _id: id, isDeleted: false })
    .findOne({ _id: id, isDeleted: false })
    .populate('tableIds');

exports.createTableType = (tableType) => tableTypeModel.create(tableType);

exports.updateTableType = (id, tableType) =>
  tableTypeModel.findByIdAndUpdate(id, tableType, { new: true });

exports.deleteTableType = (id) =>
  tableTypeModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );

exports.getTableTypeByNumberOfPeople = (numberOfPeople) =>
  tableTypeModel.find({
    minNumberOfSeats: { $lte: numberOfPeople },
    maxNumberOfSeats: { $gte: numberOfPeople },
    isDeleted: false,
  });
