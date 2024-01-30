const InvoiceItems = require('../models/invoiceItemModel');

// create invoice item
exports.createInvoiceItem = (invoiceItem) => InvoiceItems.create(invoiceItem);
