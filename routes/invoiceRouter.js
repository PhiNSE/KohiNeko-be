const express = require('express');
const Invoice = require('../controllers/invoiceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// router.route('/').post(Invoice.createInvoice).get(Invoice.getAllInvoices);
router.route('/:id').get(Invoice.getInvoiceById);
router
  .route('/')
  .all(authMiddleware.verifyToken)
  .get(Invoice.getInvoiceByBookingIds)
  .post(Invoice.createInvoice);

router
  .route('/bookings/:bookingId')
  .all(authMiddleware.verifyToken)
  .post(Invoice.createInvoice);
router
  .route('/payment')
  .post(authMiddleware.verifyToken, Invoice.purchaseInvoices);

exports.router = router;
exports.path = '/invoices';
