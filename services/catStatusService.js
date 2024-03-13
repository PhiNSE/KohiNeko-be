const catStatusModel = require('../models/catStatusModel');
const catModel = require('../models/catModel');

exports.getAllCatStatuses = () =>
  catStatusModel
    .find({ isDeleted: false })
    .populate({ path: 'catId', select: '_id name' })
    .populate({ path: 'statusId', select: '_id name' });

exports.getCatStatusById = (id) =>
  catStatusModel
    .findOne({ _id: id, isDeleted: false })
    .populate({ path: 'catId', select: '_id name' })
    .populate({ path: 'statusId', select: '_id name' });

exports.createCatStatus = async (catStatus) => {
  if (catStatus.startTime === null) catStatus.startTime = Date.now();

  const lastCatStatus = await catStatusModel
    .findOne({ catId: catStatus.catId })
    .sort({ startTime: -1 });
  if (lastCatStatus && !lastCatStatus.endTime) {
    lastCatStatus.endTime = lastCatStatus.startTime;
    lastCatStatus.save();
  }

  const creatingCatStatus = await catStatusModel.create(catStatus);
  if (creatingCatStatus) {
    await catModel.findByIdAndUpdate(
      catStatus.catId,
      {
        $push: {
          catStatus: creatingCatStatus._id,
        },
      },
      { new: true },
    );
  }
  return creatingCatStatus;
};

exports.updateCatStatus = (id, catStatus) =>
  catStatusModel.findByIdAndUpdate(id, catStatus, { new: true });

exports.deleteCatStatus = (id) =>
  catStatusModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
