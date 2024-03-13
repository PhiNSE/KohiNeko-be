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
  tableModel
    .find({
      tableTypeId: tableTypeId,
      areaId: areaId,
      isDeleted: false,
    })
    .populate({
      path: 'tableTypeId',
      select: 'name -_id price',
    })
    .select('_id');

// create table by area and table type
exports.createTableByAreaAndTableType = (areaId, tableTypeId, quantity) => {
  const tables = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < quantity; i++) {
    tables.push({
      areaId: areaId,
      tableTypeId: tableTypeId,
    });
  }
  return tableModel.create(tables);
};

// get all tables by area id
exports.getAllTableByAreaId = (areaId) =>
  tableModel.find({ areaId, isDeleted: false });
