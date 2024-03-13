const packageSubscriptionModel = require('../models/packageSubscriptionModel');
const packageService = require('./packageService');
const coffeeShopService = require('./coffeeShopService');
const AppError = require('../utils/appError');

exports.getAllPackageSubscriptions = () =>
  packageSubscriptionModel.find({ isDeleted: false }).populate('packageId');

exports.getPackageSubscriptionById = (id) =>
  packageSubscriptionModel.findOne({ _id: id, isDeleted: false });

exports.createPackageSubscription = async (packageId, coffeeShopId) => {
  console.log(packageId, 'packageId');
  //check if package exists
  const package = await packageService.getPackageById(packageId);
  if (!package) throw new AppError('Package is not found with that ID', 400);
  const packageSubscription = {
    packageId,
  };

  console.log(packageSubscription);
  const lastestSub = await packageSubscriptionModel
    .find({ coffeeShopId, isDeleted: false })
    .sort({ endTime: -1 })
    .limit(1);

  console.log(coffeeShopId, 'coffeeShopId');
  // const coffeeShopIdFromUser = req.
  // check if user has a coffee shop
  const coffeeShop = await coffeeShopService.getCoffeeShopById(coffeeShopId);
  if (!coffeeShop) throw new AppError('User has no coffee shop', 404);
  packageSubscription.coffeeShopId = coffeeShopId;

  //startTime
  let startTime = Date.now();
  if (lastestSub.length > 0 && lastestSub[0].endTime > Date.now()) {
    startTime = lastestSub[0].endTime;
  }
  packageSubscription.startTime = new Date(startTime); // Convert to Date object

  //endTime
  packageSubscription.endTime = new Date(packageSubscription.startTime);
  packageSubscription.endTime.setDate(
    packageSubscription.startTime.getDate() + package.duration,
  );
  return packageSubscriptionModel.create(packageSubscription);
};

exports.getCurrentPackageSubscriptionByCoffeeShopId = (coffeeShopId) =>
  packageSubscriptionModel
    .findOne({
      coffeeShopId,
      startTime: { $lte: Date.now() },
      endTime: { $gte: Date.now() },
      isDeleted: false,
    })
    .populate('packageId');
exports.isCurrentPackageSubscription = async (coffeeShopId) => {
  const currentPackageSubscription =
    await this.getCurrentPackageSubscriptionByCoffeeShopId(coffeeShopId);
  return !!currentPackageSubscription;
};

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
  packageSubscriptionModel
    .find({
      coffeeShopId,
      packageId,
      isDeleted: false,
    })
    .populate('packageId');
