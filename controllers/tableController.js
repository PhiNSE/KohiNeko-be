const tableService = require('../services/tableService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResonse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

// get all tables
exports.getAllTables = catchAsync(async (req, res, next) => {
  const tables = await tableService.getAllTables();
  res.status(200).json(new ApiResonse(200, 'success', tables));
});

// get table by id
exports.getTableById = catchAsync(async (req, res, next) => {
  const table = await tableService.getTableById(req.params.id);
  res.status(200).json(new ApiResonse(200, 'success', table));
});

// get table by table type id
exports.createTable = catchAsync(async (req, res, next) => {
  const table = await tableService.createTable(req.body);
  if (!table) {
    return next(new AppError('No table found with that ID', 404));
  }
  res.status(201).json(new ApiResonse(201, 'success', table));
});

// update table
exports.updateTable = catchAsync(async (req, res, next) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  if (!table) {
    return next(new AppError('No table found with that ID', 404));
  }
  res.status(200).json(new ApiResonse(200, 'success', table));
});

// delete table
exports.deleteTable = catchAsync(async (req, res, next) => {
  const table = await tableService.deleteTable(req.params.id);
  if (!table) {
    return next(new AppError('No table found with that ID', 404));
  }
  res.status(200).json(new ApiResonse(200, 'success', table));
});

// get all tables by table type id
exports.getAllTableByTableTypeAndByAreaId = catchAsync(
  async (req, res, next) => {
    const tables = await tableService.getAllTableByTableTypeAndByAreaId(
      req.params.tableTypeId,
      req.params.areaId,
    );
    res.status(200).json(new ApiResonse(200, 'success', tables));
  },
);

// create table by area and table type
exports.adjustTableByAreaAndTableType = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  const table = await tableService.createTableByAreaAndTableType(
    req.params.areaId,
    req.params.tableTypeId,
    quantity,
  );
  if (!table) {
    return next(new AppError('No table found with that ID', 404));
  }
  res.status(201).json(new ApiResonse(201, 'success', table));
});

// get all tables by area id
exports.getAllTableByAreaId = catchAsync(async (req, res, next) => {
  const tables = await tableService.getAllTableByAreaId(req.params.areaId);
  res.status(200).json(new ApiResonse(200, 'success', tables));
});
