const { areaStaffModel } = require('../models/areaStaffModel');
const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');
const AppError = require('../utils/appError');
const constant = require('../utils/constant');

exports.getAllAreaStaffs = () =>
  areaStaffModel.find().populate('areaId').populate('userId');

const searchAreaStaffByAreaId = (areaId, time) =>
  areaStaffModel
    .find({
      $and: [
        { areaId },
        { isDeleted: false },
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
      ],
    })
    .populate('areaId')
    .populate('userId')
    .sort({ startTime: -1 });

const searchAreaStaffByUserId = (userId, time) =>
  areaStaffModel
    .find({
      $and: [
        { userId },
        { isDeleted: false },
        { startTime: { $lte: time } },
        { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
      ],
    })
    .populate('areaId')
    .populate('userId')
    .sort({ startTime: -1 });

const searchAreaStaffByAreaIdAndUserId = (areaId, userId, time) =>
  areaStaffModel.find({
    $and: [
      { areaId },
      { userId },
      { isDeleted: false },
      { startTime: { $lte: time } },
      { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
    ],
  });

const searchAreaStaffByTime = (time) =>
  areaStaffModel.find({
    $and: [
      { isDeleted: false },
      { startTime: { $lte: time } },
      { $or: [{ endTime: { $gte: time } }, { endTime: null }] },
    ],
  });

exports.searchAreaStaff = async (areaId, userId, time) => {
  if (!time) time = Date.now();
  if (userId && !areaId) return searchAreaStaffByUserId(userId, time);
  if (areaId && !userId) {
    const areaStaffs = await searchAreaStaffByAreaId(areaId, time);
    console.log('aaa', areaStaffs);
    return searchAreaStaffByAreaId(areaId, time);
  }

  if (areaId && userId)
    return searchAreaStaffByAreaIdAndUserId(areaId, userId, time);
  return searchAreaStaffByTime(time);
};

exports.getAreaStaffByAreaIdNow = (areaId) => {
  const now = Date.now();
  return areaStaffModel
    .find({
      $and: [
        { areaId },
        { isDeleted: false },
        { startTime: { $lte: now } },
        {
          $or: [{ endTime: { $gte: now } }, { endTime: null }],
        },
      ],
    })
    .populate('areaId')
    .populate('userId');
};

exports.getAreaStaffByUserIdNow = (userId) => {
  const now = Date.now();
  return areaStaffModel
    .findOne({
      $and: [
        { userId },
        { isDeleted: false },
        { startTime: { $lte: now } },
        {
          $or: [{ endTime: { $gte: now } }, { endTime: null }],
        },
      ],
    })
    .populate('areaId')
    .populate('userId');
};

exports.createAreaStaff = async (areaStaff) => {
  const staff = await userModel.findById(areaStaff.userId);
  if (!staff || staff.role !== constant.STAFF_ROLE)
    throw new AppError('User is not a staff');

  if (areaStaff.startTime === null) areaStaff.startTime = Date.now();

  const lastAreaStaff = await areaStaffModel
    .findOne({ userId: areaStaff.userId })
    .sort({ startTime: -1 });
  if (lastAreaStaff && !lastAreaStaff.endTime) {
    lastAreaStaff.endTime = areaStaff.startTime;
    lastAreaStaff.save();
  }

  const creatingAreaStaff = await areaStaffModel.create(areaStaff);
  if (creatingAreaStaff) {
    const user = await userModel.findByIdAndUpdate(
      areaStaff.userId,
      {
        $push: {
          areaStaffs: creatingAreaStaff._id,
        },
      },
      { new: true },
    );
    console.log('user', user.areaStaffs);

    const area = await areaModel.findByIdAndUpdate(
      areaStaff.areaId,
      {
        $push: {
          areaStaffs: creatingAreaStaff._id,
        },
      },
      { new: true },
    );
    console.log('area', area.areaStaffs);
  }
  return creatingAreaStaff;
};

exports.updateAreaStaff = async (areaStaffId, areaStaff) =>
  areaStaffModel.findByIdAndUpdate(areaStaffId, areaStaff, { new: true });

exports.deleteAreaStaff = async (areaStaffId) =>
  areaStaffModel.findByIdAndUpdate(
    areaStaffId,
    { isDeleted: true },
    { new: true },
  );

exports.getStaffByAreaId = async (areaId) => {
  const areaStaffs = await this.searchAreaStaff(areaId, null, Date.now());
  const preStaffId = new Set();
  const staffs = [];
  console.log('areaStaffs', areaStaffs);
  areaStaffs.forEach((areaStaff) => {
    const setSize = preStaffId.size;
    preStaffId.add(areaStaff.userId);
    if (preStaffId.size > setSize) {
      console.log('areaStaff.userId', areaStaff.userId);
      staffs.push(areaStaff.userId);
    }
  });
  return staffs;
};
