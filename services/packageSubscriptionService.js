const packageSubscriptionModel = require('../models/packageSubscription');
const packageService = require('./packageService');
const AppError = require('../utils/appError');

exports.getAllPackageSubscriptions = () =>
  packageSubscriptionModel.find({ isDeleted: false }).populate('packageId');

exports.getPackageSubscriptionById = (id) =>
  packageSubscriptionModel.findOne({ _id: id, isDeleted: false });

exports.createPackageSubscription = async (packageSubscription, user) => {
  const lastestSub = await packageSubscriptionModel
    .find({ isDeleted: false })
    .sort({ endTime: -1 })
    .limit(1);
  let startTime = Date.now();
  console.log(lastestSub[0].endTime);
  if (lastestSub.length > 0 && lastestSub[0].endTime > Date.now()) {
    startTime = lastestSub[0].endTime;
  }
  packageSubscription.startTime = startTime;
  const package = await packageService.getPackageById(
    packageSubscription.packageId,
  );
  if (!package) throw new AppError('Package not found', 404);

  const durationInMilliseconds = package.duration * 24 * 60 * 60 * 1000;
  packageSubscription.endTime =
    packageSubscription.startTime + durationInMilliseconds;
  packageSubscription.coffeeShopId = user.coffeeShopId;
  return packageSubscriptionModel.create(packageSubscription);
};

exports.getCurrentPackageSubscriptionByCoffeeShopId = (coffeeShopId) =>
  packageSubscriptionModel.findOne({
    coffeeShopId,
    startTime: { $lte: Date.now() },
    endTime: { $gte: Date.now() },
    isDeleted: false,
  });

exports.updatePackageSubscription = (id, packageSubscription) =>
  packageSubscriptionModel.findByIdAndUpdate(id, packageSubscription, {
    new: true,
  });

exports.deletePackageSubscription = (id) =>
  packageSubscriptionModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

exports.getPackageSubscriptionByPackageId = (packageId) =>
  packageSubscriptionModel.findOne({
    packageId,
    isDeleted: false,
  });

exports.getAllPackageSubscriptionByCoffeeShopId = (coffeeShopId) =>
  packageSubscriptionModel
    .find({ coffeeShopId, isDeleted: false })
    .populate('packageId');

exports.getPackageSubscriptionByCoffeeShopIdAndPackageId = (
  packageId,
  coffeeShopId,
) =>
  packageSubscriptionModel.find({
    coffeeShopId,
    packageId,
    isDeleted: false,
  });
