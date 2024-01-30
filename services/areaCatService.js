const { areaCatModel } = require('../models/areaCatModel');

exports.getAllAreaCats = () =>
  areaCatModel.find().populate('areaId').populate('catId');

exports.searchAreaCat = (areaId, catId) => {
  if (!areaId)
    return areaCatModel.find({ catId }).populate('areaId').populate('catId');
  if (!catId)
    return areaCatModel.find({ areaId }).populate('areaId').populate('catId');
  return areaCatModel
    .find({ $and: [{ areaId }, { catId }] })
    .populate('areaId')
    .populate('catId');
};

exports.createAreaCat = (areaCat) => areaCatModel.create(areaCat);

exports.updateAreaCat = (id, areaCat) =>
  areaCatModel.findByIdAndUpdate(id, areaCat, { new: true });

exports.deleteAreaCat = (id) =>
  areaCatModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
