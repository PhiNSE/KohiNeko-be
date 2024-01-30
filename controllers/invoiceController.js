const InvoiceService = require('../services/invoiceService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');
const BookingService = require('../services/bookingService');

// create invoice
exports.createInvoice = catchAsync(async (req, res) => {
  const invoice = await InvoiceService.createInvoice(req.body);
  if (invoice) {
    await BookingService.updateInvoiceBooking(invoice);
  }
  res
    .status(201)
    .send(ApiResponse.success('Create invoice successfully', invoice));
});

// get invoice by booking ids
exports.getInvoiceByBookingIds = catchAsync(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceByBookingIds(
    req.params.bookingIds,
  );
  res
    .status(200)
    .send(ApiResponse.success('Get invoice successfully', invoice));
});
exports.getAllInvoices = catchAsync(async (req, res) => {
  const invoices = await InvoiceService.getAllInvoices();
  res
    .status(200)
    .send(ApiResponse.success('Get all invoices successfully', invoices));
});

exports.getInvoiceById = catchAsync(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceById(req.params.id);
  res
    .status(200)
    .send(ApiResponse.success('Get invoice successfully', invoice));
});
