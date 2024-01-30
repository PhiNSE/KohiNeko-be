const tableModel = require('../models/tableModel').Table;

//get all tables
exports.getAllTables = () =>
  tableModel
    .find({ isDeleted: false })
    .populate('areaId')
    .populate('tableTypeId');

// get table by id
exports.getTableById = (id) =>
  tableModel
    .findOne({ _id: id, isDeleted: false })
    .populate('areaId')
    .populate('tableTypeId');

// get table by table type id
exports.createTable = (table) => tableModel.create(table);

// update table
exports.updateTable = (id, table) =>
  tableModel.findByIdAndUpdate(id, table, { new: true });

// delete table
exports.deleteTable = (id) =>
  tableModel.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

// get all tables by table type id
exports.getAllTableByTableTypeAndByAreaId = (tableTypeId, areaId) =>
  tableModel.find({
    tableType: tableTypeId,
    areaId: areaId,
    isDeleted: false,
  });
