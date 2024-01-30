const statusService = require('../services/statusService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

exports.getAllStatuses = catchAsync(async (req, res, next) => {
  const statuses = await statusService.getAllStatuses();
  res.send(new ApiResponse(200, 'Get all statuses successfully', statuses));
});

exports.getStatusById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const status = await statusService.getStatusById(id);
  res.send(new ApiResponse(200, 'Get status by id successfully', status));
});

exports.createStatus = catchAsync(async (req, res, next) => {
  const status = await statusService.createStatus(req.body);
  if (!status) {
    next(new AppError('No status found with that ID', 404));
  }
  res.send(new ApiResponse(200, 'Create status successfully', status));
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const status = await statusService.updateStatus(id, req.body);
  if (!status) {
    next(new AppError('No status found with that ID', 404));
  }
  res.send(new ApiResponse(200, 'Update status successfully', status));
});

exports.deleteStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const status = await statusService.deleteStatus(id);
  if (!status) {
    next(new AppError('No status found with that ID', 404));
  }
  res.send(new ApiResponse(200, 'Delete status successfully', status));
});
