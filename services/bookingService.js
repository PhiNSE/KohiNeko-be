const mongoose = require('mongoose');
const BookingModel = require('../models/bookingModel');
const AppError = require('../utils/appError');
const vnpayController = require('../controllers/vnPayController');
const constants = require('../utils/constant');
const userService = require('./userService');
const {
  bookingStatus,
  customerRefundPenalty,
} = require('../utils/bookingConstant');
const { error } = require('../dto/ApiResponse');
// const TableModel = require('../models/tableModel');
// const catchAsync = require('../utils/catchAsync/catchAsync');

// exports.bookedTableInTime = catchAsync(
//   async (tableTypeId, startTime, endTime) => {
//     const numberOfTable = await TableModel.countDocuments({
//       tableType: tableTypeId,
//     });
//   },
// );
exports.createBooking = (bookingModel) => BookingModel.create(bookingModel);
exports.updateInvoiceBooking = (invoice) =>
  BookingModel.findByIdAndUpdate(
    { _id: invoice.bookingId },
    { $push: { invoices: invoice } },
    { new: true },
  );

exports.getAllBookingInDate = (startTime, endTime, coffeeShopId) =>
  BookingModel.find({
    $and: [
      {
        $or: [
          { startTime: { $gte: startTime, $lte: endTime } },
          { endTime: { $gte: startTime, $lte: endTime } },
        ],
      },
      { status: { $in: ['in progress', 'pending'] } },
      { coffeeShopId: coffeeShopId },
    ],
  });

exports.getAllBookingInDateInArea = (
  startTime,
  endTime,
  areaId,
  coffeeShopId,
) =>
  BookingModel.aggregate([
    {
      $lookup: {
        from: 'tables', // replace with your actual Table collection name
        localField: 'tableId',
        foreignField: '_id',
        as: 'table',
      },
    },
    { $unwind: '$table' },
    {
      $match: {
        $and: [
          {
            $or: [
              {
                startTime: {
                  $gte: new Date(startTime),
                  $lte: new Date(endTime),
                },
              },
              {
                endTime: { $gte: new Date(startTime), $lte: new Date(endTime) },
              },
            ],
          },
          {
            status: { $in: ['in progress', 'pending'] },
            'table.areaId': new mongoose.Types.ObjectId(areaId),
            coffeeShopId: new mongoose.Types.ObjectId(coffeeShopId),
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        table: 1,
      },
    },
  ]);

exports.getAllBooking = () => BookingModel.find({}).populate('invoices');

exports.getAllBookingInDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return BookingModel.find({
    startTime: { $gte: start, $lte: end },
  });
};

exports.getBookingById = (id) =>
  BookingModel.findById(id)
    .populate({
      path: 'invoices',
      match: { isDeleted: false, status: { $ne: 'unpaid' } },
      populate: {
        path: 'invoiceItems',
        match: { isDeleted: false, status: { $ne: 'unpaid' } },
        populate: { path: 'itemId', select: 'name _id images price' },
      },
      select: 'invoiceItems totalPrice status',
    })
    .populate({
      path: 'tableId',
      populate: [
        { path: 'tableTypeId', select: 'name -_id' },
        { path: 'areaId', select: 'name -_id' },
      ],
      select: 'tableTypeId areaId -_id ', // select tableTypeId from tableId
    })
    .populate('coffeeShopId', 'shopName address -_id')
    .populate(
      'customerId',
      'username email phone -_id firstName lastName phoneNumber',
    )
    .select('-__v -updatedAt -createdAt -isDeleted');

exports.getBookingByUserId = (userId, page, perPage, status, sort, key) => {
  let query = { customerId: userId };
  if (status !== '') {
    query = {
      $and: [
        {
          customerId: userId,
          status: { $in: ['finished', 'in progress', 'pending', 'refund'] },
        },
        // eslint-disable-next-line no-dupe-keys
        { status: { $ne: 'unpaid' }, status },
      ],
    };
  } else {
    query.status = { $in: ['finished', 'in progress', 'pending', 'refund'] };
  }
  if (sort === 'asc') {
    return BookingModel.aggregate([
      {
        $lookup: {
          from: 'coffee_shops', // replace with your actual CoffeeShop collection name
          localField: 'coffeeShopId',
          foreignField: '_id',
          as: 'coffeeShopId',
        },
      },
      { $unwind: '$coffeeShopId' },
      {
        $match: {
          'coffeeShopId.shopName': { $regex: key, $options: 'i' },
          ...query,
        },
      },
      {
        $lookup: {
          from: 'tables', // replace with your actual Table collection name
          localField: 'tableId',
          foreignField: '_id',
          as: 'tableId',
        },
      },
      { $unwind: '$tableId' },
      {
        $lookup: {
          from: 'areas', // replace with your actual Area collection name
          localField: 'tableId.areaId',
          foreignField: '_id',
          as: 'tableId.areaId',
        },
      },
      { $unwind: '$tableId.areaId' },
      {
        $lookup: {
          from: 'table_types', // replace with your actual TableType collection name
          localField: 'tableId.tableTypeId',
          foreignField: '_id',
          as: 'tableId.tableTypeId',
        },
      },
      { $unwind: '$tableId.tableTypeId' },
      {
        $lookup: {
          from: 'invoices', // replace with your actual Invoice collection name
          localField: 'invoices',
          foreignField: '_id',
          as: 'invoices',
        },
      },
      {
        $sort: { startTime: 1 },
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: Number(perPage),
      },
    ]);
  }

  // return BookingModel.find(query)
  //   .populate({
  //     path: 'coffeeShopId',
  //     select: 'shopName images address -_id',
  //     match: { shopName: { $regex: key, $options: 'i' } },
  //   })
  //   .populate({
  //     path: 'tableId',
  //     populate: [
  //       { path: 'tableTypeId', select: 'name -_id' },
  //       { path: 'areaId', select: 'name -_id' },
  //     ],
  //     select: 'tableTypeId areaId -_id ', // select tableTypeId from tableId
  //   })
  //   .populate({
  //     path: 'invoices',
  //     populate: {
  //       path: 'invoiceItems',
  //       populate: { path: 'itemId', select: 'name images -_id' },
  //     },
  //     select: 'invoiceItems totalPrice',
  //   })
  //   .sort({ startTime: -1 })
  //   .skip((page - 1) * perPage)
  //   .limit(perPage);

  return BookingModel.aggregate([
    {
      $lookup: {
        from: 'coffee_shops', // replace with your actual CoffeeShop collection name
        localField: 'coffeeShopId',
        foreignField: '_id',
        as: 'coffeeShopId',
      },
    },
    { $unwind: '$coffeeShopId' },
    {
      $match: {
        'coffeeShopId.shopName': { $regex: key, $options: 'i' },
        ...query,
      },
    },
    {
      $lookup: {
        from: 'tables', // replace with your actual Table collection name
        localField: 'tableId',
        foreignField: '_id',
        as: 'tableId',
      },
    },
    { $unwind: '$tableId' },
    {
      $lookup: {
        from: 'areas', // replace with your actual Area collection name
        localField: 'tableId.areaId',
        foreignField: '_id',
        as: 'tableId.areaId',
      },
    },
    { $unwind: '$tableId.areaId' },
    {
      $lookup: {
        from: 'table_types', // replace with your actual TableType collection name
        localField: 'tableId.tableTypeId',
        foreignField: '_id',
        as: 'tableId.tableTypeId',
      },
    },
    { $unwind: '$tableId.tableTypeId' },
    {
      $lookup: {
        from: 'invoices', // replace with your actual Invoice collection name
        localField: 'invoices',
        foreignField: '_id',
        as: 'invoices',
      },
    },
    {
      $sort: { startTime: -1 },
    },
    {
      $skip: (page - 1) * perPage,
    },
    {
      $limit: Number(perPage),
    },
  ]);
};

exports.updateStatus = (id, status) =>
  BookingModel.findByIdAndUpdate(id, { status }, { new: true });

const handleRefund = async (bookingId, userId, refundAmount, refundPercent) => {
  const booking = await BookingModel.findById(bookingId).populate('invoices');
  if (!booking) throw new AppError('Booking not found', 404);
  booking.status = bookingStatus.REFUND;
  booking.refundMakerId = userId;
  booking.refundAmount = refundAmount;
  booking.refundPercent = refundPercent;

  const user = await userService.findOne({ _id: userId });
  if (!user) throw new AppError('User not found', 404);
  const { invoices } = booking;

  const session = await mongoose.startSession();
  session.startTransaction();
  //update booking status to refund
  try {
    await Promise.all(
      invoices.map(async (invoice) => {
        invoice.status = bookingStatus.REFUND;
        await invoice.save();
      }),
    );

    //plus refund amount to user wallet
    const oldWallet = user.wallet;
    user.wallet += refundAmount;
    await userService.updateUser(user._id, user);

    session.endSession();
    await booking.save();
    return {
      refundMakerId: user._id,
      bookingCustomerId: booking.customerId,
      refundAmount: refundAmount,
      refundPercent: refundPercent,
      oldWallet: oldWallet,
      wallet: user.wallet,
      bookingId: booking._id,
      bookingStatus: booking.status,
    };
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();
    throw new AppError(`Refund failed: ${error.message}`, 500);
  } finally {
    session.endSession();
  }
};

const getRefundAmount = async (booking, user) => {
  const now = new Date();
  const differ = booking.startTime - now;
  if (differ < 0)
    throw new AppError(
      `Refund duration expired: Your booking since ${booking.startTime}`,
      400,
    );

  const { invoices } = booking;
  let refundAmount = booking.price;
  //if refund maker is user and booking time is less than 24 hours, then refund 50% of booking total amount
  let refundPercent = 0;
  if (
    user.role === constants.CUSTOMER_ROLE &&
    differ < customerRefundPenalty.MAX_TIME
  ) {
    refundPercent = customerRefundPenalty.PENALTY;
    refundAmount *= refundPercent;
  }

  invoices.forEach((invoice) => {
    refundAmount += invoice.totalPrice;
  });
  return { refundAmount, refundPercent };
};

const isBookingOwnerOrShopManager = async (bookingId, user) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);
  if (user.role === constants.ADMIN_ROLE) return true;
  if (
    user.role === constants.SHOP_MANAGER ||
    user.role === constants.STAFF_ROLE
  )
    return booking.coffeeShopId === user.shopId;
  return booking.customerId === user._id;
};

exports.getRefundBookingInformation = async (id, req) => {
  const booking = await BookingModel.findById(id).populate('invoices');
  if (!booking) throw new AppError('Booking not found', 404);
  console.log(req.user, 'req.user');
  if (!isBookingOwnerOrShopManager(id, req.user))
    throw new AppError('You are not the owner of this booking', 403);
  if (booking.status === bookingStatus.REFUND)
    throw new AppError('Booking already refunded', 400);
  if (
    booking.status !== bookingStatus.PAID &&
    booking.status !== bookingStatus.PENDING
  )
    throw new AppError('Booking has not been paid', 400);
  const { refundAmount, refundPercent } = await getRefundAmount(
    booking,
    req.user,
  );
  const bookingPrice = booking.price;
  return { refundAmount, refundPercent, bookingPrice };
};

exports.refundBooking = async (id, req) => {
  const booking = await BookingModel.findById(id).populate('invoices');
  console.log(booking, 'booking');
  console.log(bookingStatus.PENDING, 'bookingStatus.PENDING');
  console.log(
    booking.status === bookingStatus.PENDING,
    'booking.status === bookingStatus.PENDING',
  );
  if (!booking) throw new AppError('Booking not found', 404);
  if (!isBookingOwnerOrShopManager(id, req.user))
    throw new AppError('You are not the owner of this booking', 403);
  if (booking.status === bookingStatus.REFUND)
    throw new AppError('Booking already refunded', 400);
  if (booking.status !== bookingStatus.PENDING)
    throw new AppError('Booking has not been paid', 400);
  const { refundAmount, refundPercent } = await getRefundAmount(
    booking,
    req.user,
  );
  const vnPayResponse = await vnpayController.createRefundUrl(
    req,
    id,
    refundAmount,
  );
  console.log(vnPayResponse.status);
  return handleRefund(id, req.user._id, refundAmount, refundPercent);
};

exports.getTotalBookingByUserId = (userId, status, key) => {
  let matchStage = { customerId: userId };
  if (status !== '') {
    matchStage = {
      // eslint-disable-next-line no-dupe-keys
      $and: [{ customerId: userId }, { status: { $ne: 'unpaid' }, status }],
    };
  } else {
    matchStage.status = {
      $in: ['finished', 'in progress', 'pending', 'refund'],
    };
  }

  return BookingModel.aggregate([
    {
      $lookup: {
        from: 'coffee_shops', // replace with your actual CoffeeShop collection name
        localField: 'coffeeShopId',
        foreignField: '_id',
        as: 'coffeeShopId',
      },
    },
    { $unwind: '$coffeeShopId' },
    {
      $match: {
        'coffeeShopId.shopName': { $regex: key, $options: 'i' },
        ...matchStage,
      },
    },
    {
      $count: 'count',
    },
  ]);
};

exports.removeBooking = (id) => BookingModel.findByIdAndDelete(id);

exports.updateAllBookingStatus = async () => {
  const now = new Date();
  await BookingModel.updateMany(
    { status: 'pending', startTime: { $lt: now } },
    { status: 'in progress' },
  );

  // Find bookings with status 'in progress' and endTime less than now
  const bookingsToUpdate = await BookingModel.find({
    status: 'in progress',
    endTime: { $lt: now },
  }).populate('invoices');

  // Update those bookings to 'finished'
  await BookingModel.updateMany(
    { status: 'in progress', endTime: { $lt: now } },
    { status: 'finished' },
  );

  // Add money to coffee shop manager wallet for each updated booking
  const totalsByShop = bookingsToUpdate.reduce((totals, booking) => {
    const totalInvoices = booking.invoices.reduce(
      (total, invoice) => total + invoice.totalPrice,
      0,
    );
    const total = booking.price + totalInvoices;
    totals[booking.coffeeShopId] = (totals[booking.coffeeShopId] || 0) + total;
    return totals;
  }, {});

  // Update each shop manager's wallet
  const updatePromises = Object.entries(totalsByShop).map(
    async ([coffeeShopId, total]) => {
      const user = await userService.findOne({
        coffeeShopId,
        role: constants.SHOP_MANAGER,
      });
      if (user) {
        user.wallet += total;
        await userService.updateUser(user._id, user);
      }
    },
  );

  await Promise.all(updatePromises);

  return bookingsToUpdate;
};

// getBookingByCoffeeShopId

exports.getBookingByCoffeeShopId = async (
  coffeeShopId,
  page,
  perPage,
  bookingStatusInput,
  sort,
  key,
) => {
  let matchStage = {
    coffeeShopId,
    status: bookingStatusInput,
  };

  if (key) {
    matchStage = {
      coffeeShopId,
      status: bookingStatusInput,
      $or: [{ idLastFour: key }],
    };
  }

  let ids = [];
  if (key) {
    const result = await BookingModel.aggregate([
      {
        $addFields: {
          idString: { $toString: '$_id' },
          idLastFour: {
            $substr: [
              { $toString: '$_id' },
              { $subtract: [{ $strLenCP: { $toString: '$_id' } }, 4] },
              4,
            ],
          },
        },
      },
      {
        $match: matchStage,
      },
    ]);
    ids = result.map((doc) => doc._id); // Populate ids array with _id from result
  }

  const query = {
    coffeeShopId,
  };
  if (bookingStatusInput !== '') {
    query.status = bookingStatusInput;
  } else {
    query.status = {
      $in: ['finished', 'in progress', 'pending', 'refund'],
    };
  }
  if (key) {
    query._id = { $in: ids };
  }

  return BookingModel.find(query)
    .populate(
      'customerId',
      'username email phone -_id firstName lastName phoneNumber',
    )
    .populate({
      path: 'tableId',
      populate: [
        { path: 'tableTypeId', select: 'name -_id' },
        { path: 'areaId', select: 'name -_id' },
      ],
      select: 'tableTypeId areaId -_id ', // select tableTypeId from tableId
    })
    .populate('coffeeShopId', 'shopName')
    .sort({ startTime: sort })
    .skip((page - 1) * perPage)
    .limit(perPage);
};

exports.getTotalBookingByCoffeeShopId = async (
  coffeeShopId,
  bookingStatusInput,
  key,
) => {
  let matchStage = {
    coffeeShopId,
    status: bookingStatusInput,
  };

  if (key) {
    matchStage = {
      coffeeShopId,
      status: bookingStatusInput,
      $or: [{ idLastFour: key }],
    };
  }

  let ids = [];
  if (key) {
    const result = await BookingModel.aggregate([
      {
        $addFields: {
          idString: { $toString: '$_id' },
          idLastFour: {
            $substr: [
              { $toString: '$_id' },
              { $subtract: [{ $strLenCP: { $toString: '$_id' } }, 4] },
              4,
            ],
          },
        },
      },
      {
        $match: matchStage,
      },
    ]);
    ids = result.map((doc) => doc._id); // Populate ids array with _id from result
  }

  const query = {
    coffeeShopId,
  };
  if (bookingStatusInput !== '') {
    query.status = bookingStatusInput;
  } else {
    query.status = {
      $in: ['finished', 'in progress', 'pending', 'refund'],
    };
  }
  if (key) {
    query._id = { $in: ids };
  }
  return await BookingModel.countDocuments(query);
};
