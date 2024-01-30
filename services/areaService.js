const areaModel = require('../models/areaModel');

exports.getAllAreas = () => areaModel.find({ isDeleted: false });

exports.getAreaById = (id) => areaModel.findOne({ _id: id, isDeleted: false });

exports.createArea = (area) => areaModel.create(area);

exports.updateArea = (id, area) =>
  areaModel.findByIdAndUpdate(id, area, { new: true });

exports.deleteArea = (id) =>
  areaModel.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

exports.addImage = async (id, imageURL) => {
  const area = await areaModel.findById(id);
  area.image.push(imageURL);
  return area.save();
};
