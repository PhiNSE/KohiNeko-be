const BookingService = require('../services/bookingService');
const CoffeeShopService = require('../services/coffeeShopService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const TableService = require('../services/tableService');
const AppError = require('../utils/appError');
const { changeDayNumberToDayString } = require('../utils/util');
const invoiceService = require('../services/invoiceService');
const AreaService = require('../services/areaService');

const convertTo24HourTime = (time) => {
  const [hourMinute, period] = time.split(' ');
  const [hourGet, minuteGet] = hourMinute.split(':');
  let hour = parseInt(hourGet, 10);
  const minutes = parseInt(minuteGet, 10);
  const isPM = period.toUpperCase() === 'PM';

  if (isPM && hour !== 12) {
    hour += 12;
  } else if (!isPM && hour === 12) {
    hour = 0;
  }
  return hour * 60 + parseInt(minutes, 10);
};

const convertToTime = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds);
  return date;
};

const convertToDateTime = (date, timeString) => {
  const timeInMinutes = convertTo24HourTime(timeString);
  const newDate = new Date(date);
  newDate.setHours(timeInMinutes / 60);
  newDate.setMinutes(timeInMinutes % 60);
  return newDate;
};

const getHoursForDay = (openTimeArray, day) => {
  const dayData = openTimeArray.find((item) => item.day === day);
  return dayData
    ? { openHour: dayData.openHour, closeHour: dayData.closeHour }
    : null;
};

//get available tables in area
const getAvailableTables = async (
  startTime,
  endTime,
  tableTypeId,
  areaId,
  coffeeShopId,
) => {
  const bookingInDate = await BookingService.getAllBookingInDate(
    startTime,
    endTime,
    coffeeShopId,
  );
  const bookedTables = bookingInDate.map((booking) => booking.tableId);
  console.log(bookedTables, 'bookedTables');
  // const tableType =
  //   await TableTypeService.getTableTypeByNumberOfPeople(numberOfPeople);
  // // console.log(tableType);
  // if (tableType.length === 0) {
  //   throw new AppError('Table type not found', 404);
  // }
  const tables = await TableService.getAllTableByTableTypeAndByAreaId(
    tableTypeId,
    areaId,
  );
  console.log(tables, bookedTables, 'tables');
  return tables.filter(
    (table) => !bookedTables.toString().includes(table._id.toString()),
  );
};

// const isAvailableTime = (areaId, coffeeShopId, availableTimes) => {};

const getAvailableTimes = async (
  date,
  timeGap,
  tableTypeId,
  areaId,
  coffeeShopId,
) => {
  const coffeeShop = await CoffeeShopService.getCoffeeShopById(coffeeShopId);

  const day = changeDayNumberToDayString(date.getDay());
  const dayHours = getHoursForDay(coffeeShop.openTime, day);
  const openTime = convertToDateTime(date, dayHours.openHour);
  const closeTime = convertToDateTime(date, dayHours.closeHour);
  const slotTime = [];
  for (
    let i = openTime.getTime();
    i < closeTime.getTime();
    i += 30 * 60 * 1000
  ) {
    const startTime = new Date(i);
    const endTime = new Date(i + 30 * 60 * 1000 * timeGap);
    if (endTime.getTime() > closeTime.getTime()) {
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    const availableTables = await getAvailableTables(
      startTime,
      endTime,
      tableTypeId,
      areaId,
      coffeeShopId,
    );
    if (availableTables.length > 0) {
      slotTime.push({
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
      });
    }
  }

  // Merge the time slots
  // const mergedTimeSlotsss = slotTime.reduce((acc, curr) => {
  //   if (acc.length === 0) {
  //     return [curr];
  //   }

  //   const lastSlot = acc[acc.length - 1];

  //   if (lastSlot.endTime >= curr.startTime) {
  //     lastSlot.endTime = Math.max(lastSlot.endTime, curr.endTime);
  //   } else {
  //     acc.push(curr);
  //   }

  //   return acc;
  // }, []);
  return slotTime;
};

const isSameDate = (startTime, endTime) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  return startDate.toDateString() === endDate.toDateString();
};

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tableTypeId } = req.body;
  const dateGet = new Date(req.body.date);
  dateGet.setHours(0, 0, 0, 0);
  let startHour = req.body.from;
  let endHour = req.body.to;

  startHour = convertToTime(startHour);
  endHour = convertToTime(endHour);

  const startTime = dateGet.setHours(
    startHour.getHours(),
    startHour.getMinutes(),
    0,
    0,
  );

  const endTime = dateGet.setHours(
    endHour.getHours(),
    endHour.getMinutes(),
    0,
    0,
  );
  if (startTime >= endTime) {
    return next(new AppError('Start time must be less than end time', 400));
  }
  if (startTime < Date.now()) {
    return next(
      new AppError('Start time must be greater than current time', 400),
    );
  }

  if (!isSameDate(startTime, endTime)) {
    return next(
      new AppError('Start time and end time must be in the same date', 400),
    );
  }
  const coffeeShop = await CoffeeShopService.getCoffeeShopById(
    req.body.area.coffeeShopId,
  );
  const coffeeShopFilter = {
    _id: req.body.area.coffeeShopId,
    shopName: coffeeShop.shopName,
    address: coffeeShop.address,
  };
  const date = new Date(startTime);
  date.setHours(0, 0, 0, 0);
  const startTimeDay = new Date(startTime);
  const day = changeDayNumberToDayString(startTimeDay.getDay());
  const dayHours = getHoursForDay(coffeeShop.openTime, day);
  const openTime = convertToDateTime(date, dayHours.openHour);
  const closeTime = convertToDateTime(date, dayHours.closeHour);
  const timeGap = (endTime - startTime) / (1000 * 60 * 60);
  if (startTime < openTime.getTime() || endTime > closeTime.getTime()) {
    return next(
      new AppError(
        'Start time and end time must be in the coffee shop open time',
        400,
      ),
    );
  }
  const areaId = req.body.area._id;
  if (req.body.children > 0) {
    const isChildAllow = await AreaService.isChildAllow(areaId);
    if (!isChildAllow) {
      return next(
        new AppError(
          'This area is not allow child, please choose another',
          400,
        ),
      );
    }
  }
  const numberOfPeople = req.body.adult + req.body.children;
  //Available tables in area
  const availableTables = await getAvailableTables(
    startTime,
    endTime,
    tableTypeId,
    areaId,
    req.body.area.coffeeShopId,
  );
  if (availableTables.length === 0) {
    return next(
      new AppError(
        'There is no table available in this time, please choose another time',
        400,
      ),
    );
  }

  const area = await AreaService.getAreaById(areaId);

  const areaFilter = {
    _id: req.body.area._id,
    name: area.name,
  };

  const bookingReq = {
    coffeeShopId: coffeeShopFilter,
    areaId: areaFilter,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    numberOfPeople: numberOfPeople,
  };
  bookingReq.customerId = req.user._id;
  bookingReq.tableId = availableTables[0];
  bookingReq.status = 'unpaid';
  bookingReq.price = availableTables[0].tableTypeId.price * timeGap;
  // const booking = await BookingService.createBooking(bookingReq);

  // if (bookingReq.invoiceItems) {
  //   let invoice = {
  //     userId: req.user._id,
  //     coffeeShopId: booking.coffeeShopId,
  //     bookingId: booking._id,
  //     invoiceItems: bookingReq.invoiceItems,
  //   };
  //   invoice = await invoiceService.createInvoice(invoice);
  //   booking = await BookingService.updateInvoiceBooking(invoice);
  // }
  res
    .status(201)
    .send(ApiResponse.success('Create booking successfully', bookingReq));
});

exports.getAllBooking = catchAsync(async (req, res, next) => {
  const bookings = await BookingService.getAllBooking();
  res
    .status(200)
    .send(ApiResponse.success('Get all booking successfully', bookings));
});

exports.getAllAvailableTime = catchAsync(async (req, res, next) => {
  const dateGet = new Date(req.body.date);
  const date = new Date(req.body.date);
  let startHour = req.body.from;
  let endHour = req.body.to;
  const { tableTypeId } = req.body;
  startHour = convertToTime(startHour);
  endHour = convertToTime(endHour);

  const startTime = dateGet.setHours(
    startHour.getHours(),
    startHour.getMinutes(),
    0,
    0,
  );

  const endTime = dateGet.setHours(
    endHour.getHours(),
    endHour.getMinutes(),
    0,
    0,
  );
  date.setHours(0, 0, 0, 0);
  const timeGap = (endTime - startTime) / (1000 * 60 * 30);
  // const numberOfPeople = req.body.adult + req.body.children;
  const areaId = req.body.area._id;
  const { coffeeShopId } = req.body.area;
  const availableTimes = await getAvailableTimes(
    date,
    timeGap,
    tableTypeId,
    areaId,
    coffeeShopId,
  );
  res
    .status(200)
    .send(
      ApiResponse.success(
        'Get all available time successfully',
        availableTimes,
      ),
    );
});

exports.getAllBookingInDay = catchAsync(async (req, res, next) => {
  const bookings = await BookingService.getAllBookingInDay(req.body.date);
  res
    .status(200)
    .send(ApiResponse.success('Get all booking in day successfully', bookings));
});

exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await BookingService.getBookingById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Get booking successfully', booking));
});

// exports.purchaseBooking = catchAsync(async (req, res, next) => {
//   const booking = await BookingService.getBookingById(req.params.bookingId);
//   if (booking.status === 'paid') {
//     return next(new AppError('This booking has been paid', 400));
//   }
//   if (booking.status === 'cancel') {
//     return next(new AppError('This booking has been canceled', 400));
//   }
//   if (booking.invoices.length >= 0) {
//     await invoiceService.updateStatus(booking.invoices[0], 'paid');
//   }
//   const bookingResult = await BookingService.updateStatus(
//     req.params.bookingId,
//     'paid',
//   ).populate('invoices');
//   res
//     .status(200)
//     .send(ApiResponse.success('Purchase booking successfully', bookingResult));
// });

exports.createBookings = catchAsync(async (req, res, next) => {
  const booking = {
    coffeeShopId: req.body.booking.coffeeShopId._id,
    tableId: req.body.booking.tableId._id,
    startTime: req.body.booking.startTime,
    endTime: req.body.booking.endTime,
    numberOfPeople: req.body.booking.numberOfPeople,
  };
  booking.customerId = req.user._id;

  booking.status = 'unpaid';
  let bookingResult = await BookingService.createBooking(booking);
  if (req.body.invoiceItems) {
    let invoice = {
      userId: req.user._id,
      coffeeShopId: bookingResult.coffeeShopId._id,
      bookingId: bookingResult._id,
      invoiceItems: req.body.invoiceItems.map((item) => ({
        itemId: item._id,
        quantity: item.quantity,
      })),
      status: 'unpaid',
    };
    invoice = await invoiceService.createInvoice(invoice);

    bookingResult = await BookingService.updateInvoiceBooking(invoice);
  }
  res
    .status(200)
    .send(ApiResponse.success('Create booking successfully', bookingResult));
  // res
  //   .status(200)
  //   .send(ApiResponse.success('Purchase booking successfully', bookingResult));
});

exports.purchaseBooking = catchAsync(async (req, res, next) => {
  const booking = {
    coffeeShopId: req.body.booking.coffeeShopId._id,
    tableId: req.body.booking.tableId._id,
    startTime: req.body.booking.startTime,
    endTime: req.body.booking.endTime,
    numberOfPeople: req.body.booking.numberOfPeople,
  };
  booking.customerId = req.user._id;

  booking.status = 'unpaid';
  let bookingResult = await BookingService.createBooking(booking);
  if (req.body.invoiceItems) {
    let invoice = {
      userId: req.user._id,
      coffeeShopId: bookingResult.coffeeShopId._id,
      bookingId: bookingResult._id,
      invoiceItems: req.body.invoiceItems.map((item) => ({
        itemId: item._id,
        quantity: item.quantity,
      })),
      status: 'unpaid',
    };
    invoice = await invoiceService.createInvoice(invoice);

    bookingResult = await BookingService.updateInvoiceBooking(invoice);
  }
  res
    .status(200)
    .send(ApiResponse.success('Create booking successfully', bookingResult));
  // res
  //   .status(200)
  //   .send(ApiResponse.success('Purchase booking successfully', bookingResult));
});

exports.refundBooking = catchAsync(async (req, res, next) => {
  const booking = await BookingService.refundBooking(req.params.id, req);
  res
    .status(200)
    .send(ApiResponse.success('Refund booking successfully', booking));
});

exports.getBookingByUserId = catchAsync(async (req, res, next) => {
  const { page, perPage, bookingStatus, sort, key } = req.query;
  const bookings = await BookingService.getBookingByUserId(
    req.user._id,
    page,
    perPage,
    bookingStatus,
    sort,
    key,
  );
  bookings.map((booking) => {
    let allInvoicesPrice = 0;
    booking.invoices.forEach(({ totalPrice }) => {
      allInvoicesPrice += totalPrice;
    });
    booking.totalPrice = booking.price + allInvoicesPrice;
    return booking;
  });
  res
    .status(200)
    .send(ApiResponse.success('Get booking by user id successfully', bookings));
});

exports.purchaseBookingByUserWallet = catchAsync(async (req, res, next) => {
  const booking = await BookingService.getBookingById(req.params.bookingId);
  // const { bookingId } = req.params;
  if (booking.status === 'pending') {
    return next(new AppError('This booking has been paid', 400));
  }
  if (booking.status === 'cancel') {
    return next(new AppError('This booking has been canceled', 400));
  }
  const { user } = req;
  if (user.wallet < booking.price) {
    // BookingService.removeBooking(bookingId);
    // await invoiceService.updateStatus(booking.invoices, 'cancel');
    return next(new AppError('Not enough money in wallet', 400));
  }
  user.wallet -= booking.price;
  await user.save({ validateBeforeSave: false });
  if (booking.invoices) {
    await invoiceService.updateStatus(booking.invoices, 'paid');
  }
  const bookingResult = await BookingService.updateStatus(
    req.params.bookingId,
    'pending',
  );
  res
    .status(200)
    .send(ApiResponse.success('Purchase booking successfully', bookingResult));
});

exports.getTotalBookingByUserId = catchAsync(async (req, res, next) => {
  const { status, key } = req.query;
  const total = await BookingService.getTotalBookingByUserId(
    req.user._id,
    status,
    key,
  );
  const result = total[0].count;

  res
    .status(200)
    .send(
      ApiResponse.success('Get total booking by user id successfully', result),
    );
});

//make function to change all booking status "pending to in progress" and "in progress to done" after time is up and make cron job to run this function every 1 minute or 30 seconds
exports.changeBookingStatus = catchAsync(async (req, res, next) => {
  const bookings = await BookingService.getAllBooking();
  const now = new Date();
  bookings.forEach(async (booking) => {
    if (booking.status === 'pending' && booking.startTime < now) {
      await BookingService.updateStatus(booking._id, 'in progress');
    }
    if (booking.status === 'in progress' && booking.endTime < now) {
      await BookingService.updateStatus(booking._id, 'finished');
    }
  });
  res
    .status(200)
    .send(ApiResponse.success('Change booking status successfully', null));
});

exports.getBookingByCoffeeShopId = catchAsync(async (req, res, next) => {
  const { page, perPage, bookingStatus, sort, key } = req.query;
  const { coffeeShopId } = req.user;
  // console.log(req.user.coffeeShopId);
  // console.log(coffeeShopId);
  const bookings = await BookingService.getBookingByCoffeeShopId(
    coffeeShopId,
    page,
    perPage,
    bookingStatus,
    sort,
    key,
  );
  // console.log(bookings);
  res
    .status(200)
    .send(
      ApiResponse.success(
        'Get booking by coffee shop id successfully',
        bookings,
      ),
    );
});

exports.getTotalBookingByCoffeeShopId = catchAsync(async (req, res, next) => {
  const { bookingStatus, key } = req.query;
  const { coffeeShopId } = req.user;
  // console.log(req.user.coffeeShopId);
  // console.log(coffeeShopId);
  const bookings = await BookingService.getTotalBookingByCoffeeShopId(
    coffeeShopId,
    bookingStatus,
    key,
  );
  // console.log(bookings);
  res
    .status(200)
    .send(
      ApiResponse.success(
        'Get booking by coffee shop id successfully',
        bookings,
      ),
    );
});

exports.getRefundBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const bookings = await BookingService.getRefundBookingInformation(id, req);
  res
    .status(200)
    .send(ApiResponse.success('Get refund booking successfully', bookings));
});
