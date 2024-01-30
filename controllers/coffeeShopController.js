const coffeeShoService = require('../services/coffeeShopService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');

exports.saveCoffeeShop = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShoService.saveCoffeeShop(req.body);
  res
    .status(200)
    .send(ApiResponse.success('Save coffee shop successfully', coffeeShop));
});
exports.getAllCoffeeShops = catchAsync(async (req, res, next) => {
  const { page, perPage, key, sort } = req.query;
  const coffeeShops = await coffeeShoService.getAllCoffeeShops(
    page,
    sort,
    key,
    perPage,
  );
  res
    .status(200)
    .send(
      ApiResponse.success('Get all coffee shops successfully', coffeeShops),
    );
});
exports.getCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShoService.getCoffeeShopById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Get coffee shop successfully', coffeeShop));
});
exports.deleteCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShoService.deleteCoffeeShopById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Delete coffee shop successfully', coffeeShop));
});

exports.updateCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShoService.updateCoffeeShopById(
    req.params.id,
    req.body,
  );
  res
    .status(200)
    .send(ApiResponse.success('Update coffee shop successfully', coffeeShop));
});
