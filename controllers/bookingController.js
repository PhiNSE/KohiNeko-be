const BookingService = require('../services/bookingService');
const CoffeeShopService = require('../services/coffeeShopService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const TableService = require('../services/tableService');
const TableTypeService = require('../services/tableTypeService');
const AppError = require('../utils/appError');
const { changeDayNumberToDayString } = require('../utils/util');
const invoiceService = require('../services/invoiceService');

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

const getAvailableTables = async (
  startTime,
  endTime,
  numberOfPeople,
  areaId,
) => {
  const bookingInDate = await BookingService.getAllBookingInDate(
    startTime,
    endTime,
  );
  const bookedTables = bookingInDate.map((booking) => booking.tableId);
  const tableType =
    await TableTypeService.getTableTypeByNumberOfPeople(numberOfPeople);
  if (!tableType) {
    throw new AppError('Table type not found', 404);
  }
  const tables = await TableService.getAllTableByTableTypeAndByAreaId(
    tableType._id,
    areaId,
  );
  return tables.filter(
    (table) => !bookedTables.toString().includes(table._id.toString()),
  );
};

// const isAvailableTime = (areaId, coffeeShopId, availableTimes) => {};

const getAvailableTimes = async (
  date,
  timeGap,
  numberOfPeople,
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
      numberOfPeople,
      areaId,
    );
    if (availableTables.length > 0) {
      slotTime.push({
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
      });
    }
  }

  // Merge the time slots
  const mergedTimeSlotsss = slotTime.reduce((acc, curr) => {
    if (acc.length === 0) {
      return [curr];
    }

    const lastSlot = acc[acc.length - 1];

    if (lastSlot.endTime >= curr.startTime) {
      lastSlot.endTime = Math.max(lastSlot.endTime, curr.endTime);
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);

  return mergedTimeSlotsss;
};
const isSameDate = (startTime, endTime) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  return startDate.toDateString() === endDate.toDateString();
};

exports.createBooking = catchAsync(async (req, res, next) => {
  const { startTime, endTime } = req.body;
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
    req.body.coffeeShopId,
  );
  const date = new Date(req.body.startTime);
  date.setHours(0, 0, 0, 0);
  const startTimeDay = new Date(startTime);
  const day = changeDayNumberToDayString(startTimeDay.getDay());
  const dayHours = getHoursForDay(coffeeShop.openTime, day);
  const openTime = convertToDateTime(date, dayHours.openHour);
  const closeTime = convertToDateTime(date, dayHours.closeHour);
  if (startTime < openTime.getTime() || endTime > closeTime.getTime()) {
    return next(
      new AppError(
        'Start time and end time must be in the coffee shop open time',
        400,
      ),
    );
  }

  const availableTables = await getAvailableTables(
    req.body.startTime,
    req.body.endTime,
    req.body.numberOfPeople,
    req.body.areaId,
  );
  if (availableTables.length === 0) {
    return next(
      new AppError(
        'There is no table available in this time, please choose another time',
        400,
      ),
    );
  }

  const bookingReq = req.body;
  bookingReq.customerId = req.user._id;
  bookingReq.tableId = availableTables[0]._id;
  bookingReq.status = 'unpaid';
  let booking = await BookingService.createBooking(bookingReq);

  if (bookingReq.invoiceItems) {
    let invoice = {
      userId: req.user._id,
      coffeeShopId: booking.coffeeShopId,
      bookingId: booking._id,
      invoiceItems: bookingReq.invoiceItems,
    };
    invoice = await invoiceService.createInvoice(invoice);
    // console.log(invoice);
    booking = await BookingService.updateInvoiceBooking(invoice);
  }
  res
    .status(201)
    .send(ApiResponse.success('Create booking successfully', booking));
});

exports.getAllBooking = catchAsync(async (req, res, next) => {
  const bookings = await BookingService.getAllBooking();
  res
    .status(200)
    .send(ApiResponse.success('Get all booking successfully', bookings));
});

exports.getAllAvailableTime = catchAsync(async (req, res, next) => {
  const date = new Date(req.body.startTime);
  date.setHours(0, 0, 0, 0);
  const timeGap = (req.body.endTime - req.body.startTime) / (1000 * 60 * 30);
  const { numberOfPeople, areaId, coffeeShopId } = req.body;
  const availableTimes = await getAvailableTimes(
    date,
    timeGap,
    numberOfPeople,
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
