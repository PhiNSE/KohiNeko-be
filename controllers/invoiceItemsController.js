const InvoiceItemService = require('../services/invoiceItemsService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');

exports.createInvoiceItem = catchAsync(async (req, res) => {
  const invoiceItem = await InvoiceItemService.createInvoiceItem(req.body);
  res
    .status(201)
    .send(ApiResponse.success('Create invoice item successfully', invoiceItem));
});
