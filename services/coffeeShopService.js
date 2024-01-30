const CoffeeShop = require('../models/coffeeShopModel');
const filterObj = require('../utils/util');

exports.saveCoffeeShop = (coffeeShop) => CoffeeShop.create(coffeeShop);
exports.getAllCoffeeShops = (page, sort, keyword, perPage) =>
  CoffeeShop.find({
    $or: [{ shopName: { $regex: keyword, $options: 'i' } }],
  })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .sort(sort);
exports.getCoffeeShopById = (id) => CoffeeShop.findById(id);
exports.deleteCoffeeShopById = (id) =>
  CoffeeShop.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
exports.addItemToCoffeeShop = (id, item) =>
  CoffeeShop.findByIdAndUpdate(id, { $push: { items: item } }, { new: true });
exports.deleteItemFromCoffeeShop = (id, itemId) =>
  CoffeeShop.findByIdAndUpdate(id, { $pull: { items: itemId } }, { new: true });
exports.getOpenTimeAndCloseTime = (id) =>
  CoffeeShop.findById(id, { openTime: 1, closeTime: 1 });
exports.updateCoffeeShopById = (id, coffeeShop) => {
  const filterCoffeeShop = filterObj(
    coffeeShop,
    'shopName',
    'address',
    'contact',
    'images',
    'openTime',
    'description',
    'status',
  );
  return CoffeeShop.findByIdAndUpdate(id, filterCoffeeShop, { new: true });
};
