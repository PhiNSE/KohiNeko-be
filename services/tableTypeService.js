const tableTypeModel = require('../models/tableTypeModel').TableType;
const tableModel = require('../models/tableModel').Table;

exports.getAllTableTypes = () =>
  tableTypeModel.find({ isDeleted: false }).populate('tableIds');

exports.searchTableTypes = (coffeeShopId, name, description) => {
  const regexName = new RegExp(name, 'i');
  const regexDescription = new RegExp(description, 'i');
  return tableTypeModel.find({
    coffeeShopId,
    $or: [{ name: regexName }, { description: regexDescription }],
    isDeleted: false,
  });
};

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

exports.getTableTypeByCoffeeShopId = async (coffeeShopId) => {
  let tableTypes = await tableTypeModel.find({
    coffeeShopId,
    isDeleted: false,
  });

  const counts = await Promise.all(
    tableTypes.map((tableType) =>
      tableModel.countDocuments({
        tableTypeId: tableType._id,
        isDeleted: false,
      }),
    ),
  );

  tableTypes = tableTypes.map((tableType, index) => ({
    ...tableType._doc,
    tableCount: counts[index],
  }));

  return tableTypes;
};
