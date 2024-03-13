const areaStaffService = require('../services/areaStaffService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const AppError = require('../utils/appError');
const ApiResponse = require('../dto/ApiResponse');
const areaCatService = require('../services/areaCatService');
const catService = require('../services/catService');

exports.getAllAreaStaffs = catchAsync(async (req, res, next) => {
  const areaStaffs = await areaStaffService.getAllAreaStaffs();
  res
    .status(200)
    .json(new ApiResponse(200, 'Get all areaStaffs successfully', areaStaffs));
});

exports.searchAreaStaff = catchAsync(async (req, res, next) => {
  const { areaId, userId, time } = req.query;
  const areaStaffs = await areaStaffService.searchAreaStaff(
    areaId,
    userId,
    time,
  );
  res
    .status(200)
    .json(new ApiResponse(200, 'Search areaStaffs successfully', areaStaffs));
});

exports.createAreaStaff = catchAsync(async (req, res, next) => {
  const areaStaff = await areaStaffService.createAreaStaff(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, 'Create areaStaff successfully', areaStaff));
});

exports.updateAreaStaff = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const areaStaff = await areaStaffService.updateAreaStaff(id, req.body);
  if (!areaStaff) return next(new AppError(404, 'AreaStaff not found'));
  res
    .status(200)
    .json(new ApiResponse(200, 'Update areaStaff successfully', areaStaff));
});

exports.deleteAreaStaff = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const areaStaff = await areaStaffService.deleteAreaStaff(id);
  if (!areaStaff) return next(new AppError(404, 'AreaStaff not found'));
  res
    .status(200)
    .json(new ApiResponse(200, 'Delete areaStaff successfully', areaStaff));
});

exports.getStaffByAreaId = catchAsync(async (req, res, next) => {
  const { areaId } = req.params;
  const areaStaffs = await areaStaffService.getStaffByAreaId(areaId);
  res
    .status(200)
    .json(new ApiResponse(200, 'Get staff by areaId successfully', areaStaffs));
});

exports.getCatsSameArea = catchAsync(async (req, res, next) => {
  const staffId = req.user._id;
  const areaStaffArray =
    await areaStaffService.getAreaStaffByUserIdNow(staffId);
  if (areaStaffArray.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Staff is not assigned to any area right now',
          null,
        ),
      );
  }
  const areaStaff = areaStaffArray[0];
  const areaId = areaStaff.areaId._id;
  const areaCats = await areaCatService.getAreaCatByAreaIdNow(areaId);
  const catIds = areaCats.map((areaCat) => areaCat.catId);
  const catPromises = catIds.map((catId) => catService.getCatById(catId));
  const cats = await Promise.all(catPromises);
  res
    .status(200)
    .json(
      new ApiResponse(200, 'Get cats in your management successfully', cats),
    );
});
