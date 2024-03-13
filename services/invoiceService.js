const Invoice = require('../models/invoiceModel');

//create invoice
exports.createInvoice = (invoice) => Invoice.create(invoice);

//get invoice by booking ids
exports.getInvoiceByBookingIds = (bookingIds) =>
  Invoice.find({ bookingId: bookingIds });
exports.getAllInvoices = () => Invoice.find();

exports.getInvoiceById = (id) => Invoice.findById(id);

exports.updateStatus = (id, status) =>
  Invoice.findByIdAndUpdate(id, { status: status }, { new: true });
