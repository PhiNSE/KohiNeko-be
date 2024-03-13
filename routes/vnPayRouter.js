const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const vnPayRouter = express.Router({ mergeParams: true });
const vnPayController = require('../controllers/vnPayController');

vnPayRouter.route('/').post(vnPayController.createPaymentUrl);
// vnPayRouter.route('/vnpay_ipn').get(vnPayController.ipn);
vnPayRouter.route('/return').post(vnPayController.vnpay_return);
vnPayRouter
  .route('/:bookingId/invoice_offline')
  .post(authMiddleware.verifyToken, vnPayController.createInvoicePaymentUrl);
vnPayRouter
  .route('/:bookingId/invoice_offline/return')
  .get(vnPayController.vnpay_return_invoice_offline);

exports.path = '/vnPay';
exports.router = vnPayRouter;
