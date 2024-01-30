const packageService = require('../services/packageService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

exports.getAllPackages = catchAsync(async (req, res, next) => {
  const packages = await packageService.getAllPackages();
  if (!packages) {
    return next(new AppError('No packages found', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Get all packages successfully', packages));
});

exports.getPackageById = catchAsync(async (req, res, next) => {
  const package = await packageService.getPackageById(req.params.id);
  if (!package) {
    return next(new AppError('No package found with that ID', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Get package by id successfully', package));
});

exports.createPackage = catchAsync(async (req, res, next) => {
  const newPackage = await packageService.createPackage(req.body);
  res
    .status(201)
    .send(ApiResponse.success('Create package successfully', newPackage));
});

exports.updatePackage = catchAsync(async (req, res, next) => {
  const updatedPackage = await packageService.updatePackage(
    req.params.id,
    req.body,
  );
  if (!updatedPackage) {
    return next(new AppError('No package found with that ID', 404));
  }
  res.status(200).send(ApiResponse.success(updatedPackage));
});

exports.deletePackage = catchAsync(async (req, res, next) => {
  const deletedPackage = await packageService.deletePackage(req.params.id);
  if (!deletedPackage) {
    return next(new AppError('No package found with that ID', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Delete package successfully', deletedPackage));
});
