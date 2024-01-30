const BookingModel = require('../models/bookingModel');
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

exports.getAllBookingInDate = (startTime, endTime) =>
  BookingModel.find({
    startTime: { $gte: startTime, $lte: endTime },
  });

exports.getAllBooking = () => BookingModel.find({});

exports.getAllBookingInDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return BookingModel.find({
    startTime: { $gte: start, $lte: end },
  });
};

exports.getBookingById = (id) => BookingModel.findById(id);
