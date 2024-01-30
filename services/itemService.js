const Item = require('../models/itemModel');
const { filterObj } = require('../utils/util');

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
  console.log(filteredBody);
  return Item.findByIdAndUpdate(id, filteredBody, { new: true });
};
