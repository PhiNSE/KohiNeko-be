const catStatusService = require('../services/catStatusService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

exports.getAllCatStatuses = catchAsync(async (req, res, next) => {
  const catStatuses = await catStatusService.getAllCatStatuses();
  res.send(
    ApiResponse.success('Get all catStatuses successfully', catStatuses),
  );
});

exports.getCatStatusById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const catStatus = await catStatusService.getCatStatusById(id);
  res.send(ApiResponse.success('Get catStatus by id successfully', catStatus));
});

exports.createCatStatus = catchAsync(async (req, res, next) => {
  const catStatus = await catStatusService.createCatStatus(req.body);
  if (!catStatus) {
    next(new AppError('No catStatus found with that ID', 404));
  }
  res.send(ApiResponse.success('Create catStatus successfully', catStatus));
});

exports.updateCatStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const catStatus = await catStatusService.updateCatStatus(id, req.body);
  if (!catStatus) {
    next(new AppError('No catStatus found with that ID', 404));
  }
  res.send(ApiResponse.success('Update catStatus successfully', catStatus));
});

exports.deleteCatStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const catStatus = await catStatusService.deleteCatStatus(id);
  if (!catStatus) {
    next(new AppError('No catStatus found with that ID', 404));
  }
  res.send(ApiResponse.success('Delete catStatus successfully', catStatus));
});
