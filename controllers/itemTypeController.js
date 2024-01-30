const itemTypeService = require('../services/itemTypeService');

const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
// const AppError = require('../utils/appError');

exports.saveItemType = catchAsync(async (req, res, next) => {
  const itemType = await itemTypeService.saveItemType(req.body);
  res
    .status(200)
    .send(ApiResponse.success('Save item type successfully', itemType));
});

exports.getAllItemTypes = catchAsync(async (req, res, next) => {
  const itemTypes = await itemTypeService.getAllItemTypes();
  res
    .status(200)
    .send(ApiResponse.success('Get all item types successfully', itemTypes));
});

exports.getItemTypeById = catchAsync(async (req, res, next) => {
  const itemType = await itemTypeService.getItemTypeById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Get item type successfully', itemType));
});

exports.deleteItemType = catchAsync(async (req, res, next) => {
  const itemType = await itemTypeService.deleteItemTypeById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Delete item type successfully', itemType));
});

exports.updateItemType = catchAsync(async (req, res, next) => {
  const itemType = await itemTypeService.updateItemTypeById(
    req.params.id,
    req.body,
  );
  res
    .status(200)
    .send(ApiResponse.success('Update item type successfully', itemType));
});
