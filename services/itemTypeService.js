const { ItemType } = require('../models/itemTypeModel');

exports.saveItemType = (itemType) => ItemType.create(itemType);
exports.getAllItemTypes = () => ItemType.find({ isDeleted: false });
exports.getItemTypeById = (id) => ItemType.findById(id);
exports.deleteItemTypeById = (id) =>
  ItemType.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
exports.updateItemTypeById = (id, itemType) =>
  ItemType.findByIdAndUpdate(id, itemType, { new: true });
