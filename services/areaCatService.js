const { areaCatModel } = require('../models/areaCatModel');
const catModel = require('../models/catModel');
const areaModel = require('../models/areaModel');
const AppError = require('../utils/appError');

exports.getAllAreaCats = () => areaCatModel.find().populate('areaId');

const searchAreaCatByCatId = (catId, time) =>
  areaCatModel
    .find({
      $and: [
        { catId },
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
        { isDeleted: false },
      ],
    })
    .populate('areaId')
    .populate('catId')
    .sort({ startTime: -1 });

const searchAreaCatByAreaId = (areaId, time) =>
  areaCatModel
    .find({
      $and: [
        { areaId },
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
        { isDeleted: false },
      ],
    })
    .populate('areaId')
    .populate('catId')
    .sort({ startTime: -1 });

const searchAreaCatByAreaIdAndCatId = (areaId, catId, time) =>
  areaCatModel
    .find({
      $and: [
        { areaId },
        { catId },
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
        { isDeleted: false },
      ],
    })
    .populate('areaId')
    .sort({ startTime: -1 });

const searchAreaCatByTime = (time) =>
  areaCatModel
    .find({
      $and: [
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
        { isDeleted: false },
      ],
    })
    .populate('areaId')
    .populate('catId')
    .sort({ startTime: -1 });

exports.searchAreaCat = (areaId, catId, time) => {
  if (!time) time = Date.now();
  if (catId && !areaId) return searchAreaCatByCatId(catId, time);
  if (areaId && !catId) return searchAreaCatByAreaId(areaId, time);
  if (areaId && catId)
    return searchAreaCatByAreaIdAndCatId(areaId, catId, time);
  return searchAreaCatByTime(time);
};

exports.getAreaCatByAreaIdNow = (areaId) => {
  const now = Date.now();
  return areaCatModel
    .find({
      $and: [
        { areaId: areaId },
        {
          isDeleted: false,
        },
        { startTime: { $lte: now } },
        {
          $or: [{ endTime: { $gte: now } }, { endTime: null }],
        },
      ],
    })
    .populate('areaId');
};

exports.getAreaCatByCatIdNow = (catId) => {
  const now = Date.now();
  return areaCatModel
    .find({
      $and: [
        { catId },
        {
          isDeleted: false,
        },
        { startTime: { $lte: now } },
        {
          $or: [{ endTime: { $gte: now } }, { endTime: null }],
        },
      ],
    })
    .populate('areaId');
};

exports.createAreaCat = async (areaCat) => {
  if (areaCat.startTime === null) areaCat.startTime = Date.now();

  const lastAreaCat = await areaCatModel
    .findOne({ catId: areaCat.catId })
    .sort({ startTime: -1 });
  if (lastAreaCat && !lastAreaCat.endTime) {
    lastAreaCat.endTime = areaCat.startTime;
    lastAreaCat.save();
  } else if (lastAreaCat && lastAreaCat.endTime) {
    if (lastAreaCat.endTime > areaCat.startTime) {
      throw new AppError(
        `New area start time must greater than last area end time`,
        400,
      );
    }
  }

  const creatingAreaCat = await areaCatModel.create(areaCat);
  if (creatingAreaCat) {
    const cat = await catModel.findByIdAndUpdate(
      areaCat.catId,
      {
        $push: {
          areaCats: creatingAreaCat._id,
        },
      },
      { new: true },
    );
    console.log('cat', cat.areaCats);

    const area = await areaModel.findByIdAndUpdate(
      areaCat.areaId,
      {
        $push: {
          areaCats: creatingAreaCat._id,
        },
      },
      { new: true },
    );
    console.log('area', area.areaCats);
  }
  return creatingAreaCat;
};

exports.updateAreaCat = (areaCatId, areaCat) =>
  areaCatModel.findByIdAndUpdate(areaCatId, areaCat, { new: true });

exports.deleteAreaCat = async (areaCatId) =>
  areaCatModel.findByIdAndUpdate(areaCatId, { isDeleted: true }, { new: true });
