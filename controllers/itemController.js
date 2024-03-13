const itemService = require('../services/itemService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');
const coffeeShopService = require('../services/coffeeShopService');
const { upload } = require('../utils/firebaseDB');

exports.searchItem = catchAsync(async (req, res, next) => {
  const { name, description } = req.query;
  const { coffeeShopId } = req.params;
  const items = await itemService.searchItem(coffeeShopId, name, description);
  res.status(200).send(ApiResponse.success('Search item successfully', items));
});

exports.updateItem = catchAsync(async (req, res, next) => {
  const item = await itemService.updateItemById(req.params.id, req.body);
  if (!item) {
    return next(new AppError('Cannot update item', 400));
  }
  res.status(200).send(ApiResponse.success('Update item successfully', item));
});

exports.saveItem = catchAsync(async (req, res, next) => {
  const { coffeeShopId } = req.params;
  const item = await itemService.saveItem(req.body);
  if (!item) {
    return next(new AppError('Cannot save item', 400));
  }
  await coffeeShopService.addItemToCoffeeShop(coffeeShopId, item._id);
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

exports.getAllItemByShopId = catchAsync(async (req, res, next) => {
  const items = await itemService.getAllItemsByShopId(req.params.coffeeShopId);
  res
    .status(200)
    .send(ApiResponse.success('Get all items by shop id successfully', items));
});

exports.addImage = [
  upload.fields([{ name: 'images' }, { name: 'placeholder', maxCount: 1 }]),
  catchAsync(async (req, res, next) => {
    const images = await itemService.addItemImages(req.params.id, req.files);
    res.status(200).send(ApiResponse.success('Add image successfully', images));
  }),
];

exports.deleteImage = catchAsync(async (req, res, next) => {
  const images = await itemService.deleteItemImages(
    req.params.id,
    req.params.imageId,
  );
  res
    .status(200)
    .send(ApiResponse.success('Delete image successfully', images));
});
