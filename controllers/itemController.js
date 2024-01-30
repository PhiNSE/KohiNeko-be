const itemService = require('../services/itemService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');
const coffeeShopService = require('../services/coffeeShopService');

exports.updateItem = catchAsync(async (req, res, next) => {
  const item = await itemService.updateItemById(req.params.id, req.body);
  if (!item) {
    return next(new AppError('Cannot update item', 400));
  }
  res.status(200).send(ApiResponse.success('Update item successfully', item));
});

exports.saveItem = catchAsync(async (req, res, next) => {
  const item = await itemService.saveItem(req.body);
  if (!item) {
    return next(new AppError('Cannot save item', 400));
  }
  await coffeeShopService.addItemToCoffeeShop(item.coffeeShopId, item._id);
  res.status(200).send(ApiResponse.success('Save item successfully', item));
});
exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await itemService.getAllItems();
  res
    .status(200)
    .send(ApiResponse.success('Get all items successfully', items));
});
exports.getItemById = catchAsync(async (req, res, next) => {
  const item = await itemService.getItemById(req.params.id);
  res.status(200).send(ApiResponse.success('Get item successfully', item));
});
exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await itemService.deleteItemById(req.params.id);
  res.status(200).send(ApiResponse.success('Delete item successfully', item));
});
