const express = require('express');
const Invoice = require('../controllers/invoiceController');

const router = express.Router();

router.route('/').post(Invoice.createInvoice).get(Invoice.getAllInvoices);
router.route('/:id').get(Invoice.getInvoiceById);
router.route('/bookings/:bookingIds').get(Invoice.getInvoiceByBookingIds);

exports.router = router;
exports.path = '/invoices';
