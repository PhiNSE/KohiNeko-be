const mongoose = require('mongoose');
const areaModel = require('../models/areaModel');
const AppError = require('../utils/appError');
const { uploadImage } = require('../utils/firebaseDB');
const { Table } = require('../models/tableModel');

exports.getAllAreas = (coffeeShopId) =>
  areaModel.find({
    isDeleted: false,
    coffeeShopId,
  });

exports.getAreaById = (id) =>
  areaModel.findOne({ _id: id, isDeleted: false }).populate('coffeeShopId');

exports.createArea = (area) => areaModel.create(area);

exports.updateArea = (id, area) =>
  areaModel.findByIdAndUpdate(id, area, { new: true });

exports.deleteArea = (id) =>
  areaModel.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

exports.addImage = async (id, image) => {
  const area = await areaModel.findById(id);
  if (!area) throw new AppError('Area not found', 404);
  const folder = `areas/${id}`;
  const imageURL = await uploadImage(image, folder);
  if (!imageURL) throw new AppError('Upload image failed', 500);
  area.images.push({ name: 'images', url: imageURL });
  return area.save();
};
exports.deleteImage = async (areaId, imageId) => {
  const area = await areaModel.findById(areaId);
  if (!area) throw new AppError('Area not found', 404);

  const image = area.images.id(imageId);
  if (!image) throw new AppError('Image not found', 404);

  area.images.pull(image._id);
  return area.save();
};

exports.isChildAllow = async (id) => {
  const area = await areaModel.findById(id);
  return area.isChildAllowed;
};

exports.getTableTypesInArea = async (id) => {
  const areaId = new mongoose.Types.ObjectId(id);
  const result = await Table.aggregate([
    {
      $match: { areaId, isDeleted: false },
    },
    {
      $group: {
        _id: '$tableTypeId',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'table_types',
        localField: '_id',
        foreignField: '_id',
        as: 'tableType',
      },
    },
    {
      $unwind: '$tableType',
    },
    {
      $project: {
        _id: 0,
        tableTypeId: '$_id',
        count: 1,
        name: '$tableType.name',
        capacity: '$tableType.capacity',
        price: '$tableType.price',
        minSeat: '$tableType.minNumberOfSeats',
        maxSeat: '$tableType.maxNumberOfSeats',
      },
    },
  ]);
  // console.log(result);
  return result;
  // Extract tableType values from the result
  // return result;
};
