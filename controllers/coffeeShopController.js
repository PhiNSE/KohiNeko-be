const coffeeShopService = require('../services/coffeeShopService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const { upload } = require('../utils/firebaseDB');

exports.saveCoffeeShop = catchAsync(async (req, res, next) => {
  const { openTime } = req.body;
  if (openTime && openTime[0].day === 'All days') {
    req.body.openTime = [
      {
        day: 'Monday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Tuesday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Wednesday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Thursday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Friday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Saturday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
      {
        day: 'Sunday',
        openHour: openTime[0].openHour,
        closeHour: openTime[0].closeHour,
      },
    ];
  }
  const coffeeShop = await coffeeShopService.saveCoffeeShop(
    req.user._id,
    req.body,
  );
  req.user.coffeeShopId = coffeeShop._id;
  res
    .status(200)
    .send(ApiResponse.success('Save coffee shop successfully', coffeeShop));
});

exports.getAllCoffeeShops = catchAsync(async (req, res, next) => {
  const { page, perPage, key, sort, city, district } = req.query;
  const coffeeShops = await coffeeShopService.getAllCoffeeShops(
    page,
    sort,
    key,
    perPage,
    city,
    district,
  );
  res
    .status(200)
    .send(
      ApiResponse.success('Get all coffee shops successfully', coffeeShops),
    );
});

exports.getAllCoffeeShopsByAdmin = catchAsync(async (req, res, next) => {
  let { key, sort } = req.query;

  if (key === undefined || sort === undefined) {
    key = '';
    sort = 1;
  }
  const coffeeShops = await coffeeShopService.getAllCoffeeShopsByAdmin(key);
  res
    .status(200)
    .send(
      ApiResponse.success('Get all coffee shops successfully', coffeeShops),
    );
});

exports.getCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShopService.getCoffeeShopById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Get coffee shop successfully', coffeeShop));
});

exports.getCoffeeShopByUserId = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShopService.getCoffeeShopByUserId(
    req.user._id,
  );
  res
    .status(200)
    .send(ApiResponse.success('Get your coffee shop successfully', coffeeShop));
});

exports.deleteCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShopService.deleteCoffeeShopById(
    req.params.id,
  );
  res
    .status(200)
    .send(ApiResponse.success('Delete coffee shop successfully', coffeeShop));
});

exports.updateCoffeeShopById = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShopService.updateCoffeeShopById(
    req.params.id,
    req.body,
  );
  res
    .status(200)
    .send(ApiResponse.success('Update coffee shop successfully', coffeeShop));
});

exports.addImage = [
  upload.fields([{ name: 'images' }, { name: 'placeholder', maxCount: 1 }]),
  catchAsync(async (req, res, next) => {
    const coffeeShop = await coffeeShopService.addImages(
      req.params.id,
      req.files,
    );
    res
      .status(200)
      .send(ApiResponse.success('Add image successfully', coffeeShop));
  }),
];

exports.deleteImages = catchAsync(async (req, res, next) => {
  await coffeeShopService.deleteImages(req.params.id, req.body.images);
  res.status(200).send(ApiResponse.success('Delete image successfully', []));
});

exports.getCoffeeShopOpenTimeAndCloseTime = catchAsync(
  async (req, res, next) => {
    console.log(req.body);
    const coffeeShop =
      await coffeeShopService.getCoffeeShopOpenTimeAndCloseTime(
        req.params.id,
        req.body.date,
      );
    res
      .status(200)
      .send(
        ApiResponse.success(
          'Get coffee shop open time and close time successfully',
          coffeeShop,
        ),
      );
  },
);

exports.getTotalsCoffeeShops = catchAsync(async (req, res, next) => {
  const { keyword } = req.query;
  const totals = await coffeeShopService.getTotalCoffeeShops(keyword);
  res
    .status(200)
    .send(ApiResponse.success('Get totals coffee shops successfully', totals));
});

exports.approveCoffeeShop = catchAsync(async (req, res, next) => {
  const coffeeShop = await coffeeShopService.approveCoffeeShop(
    req.params.id,
    req.body.approve,
  );
  res
    .status(200)
    .send(ApiResponse.success('Approve coffee shop successfully', coffeeShop));
});

exports.getAllActiveCoffeeShops = catchAsync(async (req, res, next) => {
  const coffeeShops = await coffeeShopService.getAllActiveCoffeeShops();
  res
    .status(200)
    .send(
      ApiResponse.success(
        'Get all active coffee shops successfully',
        coffeeShops,
      ),
    );
});
