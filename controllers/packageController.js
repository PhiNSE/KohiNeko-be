//vnpay
const dotenv = require('dotenv');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const { frontendURL } = require('../utils/appConstant');

const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const AppError = require('../utils/appError');

const packageService = require('../services/packageService');
const packageSubscriptionService = require('../services/packageSubscriptionService');
const coffeeShopService = require('../services/coffeeShopService');

const constant = require('../utils/constant');
const { coffeeShopStatus } = require('../utils/appConstant');

dotenv.config({ path: './config.env' });

exports.getAllPackages = catchAsync(async (req, res, next) => {
  const packages = await packageService.getAllPackages();
  if (!packages) {
    return next(new AppError('No packages found', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Get all packages successfully', packages));
});

exports.searchPackages = catchAsync(async (req, res, next) => {
  const packages = await packageService.searchPackages(
    req.query.coffeeShopId,
    req.query.userId,
  );
  if (!packages) {
    return next(new AppError('No packages found', 404));
  }
  res
    .status(200)
    .send(ApiResponse.success('Search packages successfully', packages));
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

//nvpay
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key = '';
  // eslint-disable-next-line no-restricted-syntax
  for (key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  // eslint-disable-next-line no-plusplus
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

const doSalt = (str) => {
  if (str === null || str === undefined)
    throw new AppError('Salt string must not be null or undefined', 400);
  if (typeof str !== 'string')
    throw new AppError('Salt string must be a string', 400);
  const saltedStr = `${str}/${Math.random().toString(36).substring(2, 15)}`;
  return saltedStr;
};

// const doUnSalt = (str) => {
//   if (str === null || str === undefined)
//     throw new AppError('Salt string must not be null or undefined', 400);
//   if (str !== 'string') throw new AppError('Salt string must be a string', 400);
//   return str.split('/')[0];
// };

exports.createPaymentUrl = catchAsync(async (req, res) => {
  const { user } = req;
  if (!user) throw new AppError('You are not login', 400);
  const coffeeShop = await coffeeShopService.getCoffeeShopById(
    user.coffeeShopId,
  );
  if (coffeeShop.status === coffeeShopStatus.UNAVAILABLE)
    throw new AppError('Your coffee shop is not approved by admin yet', 400);
  if (coffeeShop.status === coffeeShopStatus.REJECTED)
    throw new AppError('Your coffee shop is rejected by admin', 400);

  const returnUrl = `${frontendURL}/management/coffeeShop/package`;
  const { packageId } = req.params;
  const { bankCode } = req.body;

  const saltedPackageId = doSalt(packageId.toString());

  const package = await packageService.getPackageById(packageId);
  const amount = package.price;

  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;

  let locale = 'vn';
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  const currCode = 'VND';
  let vnpParams = {};
  vnpParams.vnp_Version = '2.1.0';
  vnpParams.vnp_Command = 'pay';
  vnpParams.vnp_TmnCode = tmnCode;
  vnpParams.vnp_Locale = locale;
  vnpParams.vnp_CurrCode = currCode;
  vnpParams.vnp_TxnRef = saltedPackageId;
  vnpParams.vnp_OrderInfo = `Thanh toan cho ma GD:${saltedPackageId}`;
  vnpParams.vnp_OrderType = 'other';
  vnpParams.vnp_Amount = amount * 100;
  vnpParams.vnp_ReturnUrl = returnUrl;
  vnpParams.vnp_IpAddr = ipAddr;
  vnpParams.vnp_CreateDate = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnpParams.vnp_BankCode = bankCode;
  }
  vnpParams = sortObject(vnpParams);
  //   console.log(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;
  vnpUrl += `?${querystring.stringify(vnpParams, { encode: false })}`;
  res
    .status(200)
    .send(ApiResponse.success('Get payment url successfully', vnpUrl));
});

const subscribePackage = async (coffeeShopId, packageId) => {
  const packageSubscription =
    await packageSubscriptionService.createPackageSubscription(
      packageId,
      coffeeShopId,
    );
  if (!packageSubscription) {
    throw new AppError('Create packageSubscription failed', 400);
  }
  return packageSubscription;
};

exports.vnpay_return = catchAsync(async (req, res) => {
  let vnpParams = req.body;
  console.log('transactionId', vnpParams.vnp_TxnRef);
  const secureHash = vnpParams.vnp_SecureHash;

  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;
  vnpParams = sortObject(vnpParams);
  // const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  if (secureHash === signed) {
    if (vnpParams.vnp_ResponseCode === '00') {
      const { user } = req;
      if (!vnpParams.vnp_TxnRef)
        return res
          .status(400)
          .json(new ApiResponse(400, 'Missing payment id (vnp_TxnRef)'));
      if (!user || user.role !== constant.SHOP_MANAGER || !user.coffeeShopId) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              'You are not a shop  manager or you had not create a shop',
              user,
            ),
          );
      }
      const coffeeShop = await coffeeShopService.getCoffeeShopById(
        user.coffeeShopId,
      );
      if (!coffeeShop)
        throw new AppError('User is not own any Coffee shop', 400);
      if (coffeeShop.status !== coffeeShopStatus.AVAILABLE)
        throw new AppError('Your coffee shop is not approved yet', 400);

      const { packageId } = req.params;
      const package = await packageService.getPackageById(packageId);
      if (!package)
        throw new AppError('Package is not found with that ID', 400);
      await subscribePackage(user.coffeeShopId, packageId);
      res
        .status(200)
        .json(new ApiResponse(`Pay package ${package.name} successfully`, 200));
    } else {
      return res.status(500).json(new ApiResponse(`Pay package fail`, 500));
    }
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, 'Payment signature is not correct'));
  }
});
