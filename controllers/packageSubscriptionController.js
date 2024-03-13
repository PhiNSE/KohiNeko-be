const packageSubscriptionService = require('../services/packageSubscriptionService');
const ApiResponse = require('../dto/ApiResponse');
const catchAsync = require('../utils/catchAsync/catchAsync');
const AppError = require('../utils/appError');
const constants = require('../utils/constant');

exports.getAllPackageSubscriptions = catchAsync(async (req, res, next) => {
  const packageSubscriptions =
    await packageSubscriptionService.getAllPackageSubscriptions();
  res.send(
    ApiResponse.success(
      'Get all packageSubscriptions successfully',
      packageSubscriptions,
    ),
  );
});

exports.getCurrentPackageSubscriptionByCoffeeShopId = catchAsync(
  async (req, res, next) => {
    const { coffeeShopId } = req.user;
    if (!req.user.coffeeShopId || req.user.role !== constants.SHOP_MANAGER) {
      next(
        new AppError(
          'You are not a shop manager or you had not create a shop',
          400,
        ),
      );
    }
    const currentPackageSubscription =
      await packageSubscriptionService.getCurrentPackageSubscriptionByCoffeeShopId(
        coffeeShopId,
      );
    res.send(
      ApiResponse.success(
        'Get current packageSubscription by coffeeShopId successfully',
        currentPackageSubscription,
      ),
    );
  },
);

exports.getAllPackageSubscriptionsByCoffeeShopId = catchAsync(
  async (req, res, next) => {
    const { coffeeShopId } = req.user;
    if (!req.user.coffeeShopId || req.user.role !== constants.SHOP_MANAGER) {
      next(
        new AppError(
          'You are not a shop manager or you had not create a shop',
          400,
        ),
      );
    }
    const packageSubscriptions =
      await packageSubscriptionService.getAllPackageSubscriptionByCoffeeShopId(
        coffeeShopId,
      );
    res.send(
      ApiResponse.success(
        'Get all packageSubscriptions by coffeeShopId successfully',
        packageSubscriptions,
      ),
    );
  },
);

exports.getPackageSubscriptionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const packageSubscription =
    await packageSubscriptionService.getPackageSubscriptionById(id);
  res.send(
    ApiResponse.success(
      'Get packageSubscription by id successfully',
      packageSubscription,
    ),
  );
});

exports.createPackageSubscription = catchAsync(async (req, res, next) => {
  if (!req.user.coffeeShopId) {
    next(
      new AppError(
        'You are not a shop manager or you had not create a shop',
        400,
      ),
    );
  }
  const { packageId } = req.body;
  console.log(req.user, 'req.user');
  console.log(req.user.coffeeShopId, 'req.user.coffeeShopId');
  const { coffeeShopId } = req.user;
  const packageSubscription =
    await packageSubscriptionService.createPackageSubscription(
      packageId,
      coffeeShopId,
    );
  if (!packageSubscription) {
    next(new AppError('Create packageSubscription failed', 400));
  }
  res.send(
    ApiResponse.success(
      'Create packageSubscription successfully',
      packageSubscription,
    ),
  );
});

exports.updatePackageSubscription = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const packageSubscription =
    await packageSubscriptionService.updatePackageSubscription(id, req.body);
  res.send(
    ApiResponse.success(
      'Update packageSubscription successfully',
      packageSubscription,
    ),
  );
});

exports.deletePackageSubscription = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const packageSubscription =
    await packageSubscriptionService.deletePackageSubscription(id);
  res.send(
    ApiResponse.success(
      'Delete packageSubscription successfully',
      packageSubscription,
    ),
  );
});
