const Item = require('../models/itemModel');
const { filterObj } = require('../utils/util');
const { uploadImage } = require('../utils/firebaseDB');
const AppError = require('../utils/appError');
const CoffeeShop = require('../models/coffeeShopModel');

exports.searchItem = async (coffeeShopId, name, description) => {
  const items = await CoffeeShop.findById(coffeeShopId)
    .populate({
      path: 'items',
      match: { isDeleted: false },
      select: '-__v -createdAt -updatedAt -coffeeShopId',
      populate: {
        path: 'itemTypeId',
        select: 'itemTypeName -_id',
      },
    })
    .select('items');
  const itemArr = items.items;
  if (!name) return itemArr;
  const regex = new RegExp(name || '', 'i');
  const regex2 = new RegExp(description || '', 'i');
  return itemArr.filter(
    (item) => regex.test(item.name) && regex2.test(item.description),
  );
};
exports.saveItem = (item) => {
  const newItem = new Item(item);
  return newItem.save();
};
exports.getAllItems = () =>
  Item.find({ isDeleted: false }, { __v: 0, isDeleted: 0 }).populate(
    'itemTypeId',
  );

exports.deleteItemById = (id) =>
  Item.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

exports.updateItemById = (id, item) => {
  const filteredBody = filterObj(
    item,
    'name',
    'price',
    'status',
    'description',
    'image',
  );
  return Item.findByIdAndUpdate(id, filteredBody, { new: true });
};

exports.getAllItemsByShopId = (shopId) =>
  CoffeeShop.findById(shopId)
    .populate({
      path: 'items',
      match: { isDeleted: false },
      select: '-__v -createdAt -updatedAt -coffeeShopId',
      populate: {
        path: 'itemTypeId',
        select: 'itemTypeName -_id',
      },
    })
    .select('items');

exports.addItemImages = async (id, images) => {
  const item = await Item.findById(id);
  if (!item) throw new AppError('Item not found', 404);
  const folder = `items/${id}`;
  if (!images || !images.images) throw new AppError('Images are required', 400);
  if (images.images) {
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    const imageURLs = await Promise.allSettled(
      images.images.map((image) => uploadImage(image, folder)),
    );
    imageURLs.forEach((result) => {
      if (result.status === 'fulfilled') {
        item.images.push({ name: 'image', url: result.value });
      }
    });
  }
  await item.save({ validateBeforeSave: false });
  return item.images;
};

exports.deleteItemImages = async (id, imageId) => {
  const item = await Item.findById(id);
  if (!item) throw new AppError('Item not found', 404);

  const image = item.images.id(imageId);
  if (!image) throw new AppError('Image not found', 404);

  item.images.pull(image._id);
  await item.save({ validateBeforeSave: false });
  return item;
};
