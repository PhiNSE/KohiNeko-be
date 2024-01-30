const express = require('express');
const invoiceItemsController = require('../controllers/invoiceItemsController');
// const authController = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').post(invoiceItemsController.createInvoiceItem);

exports.router = router;
exports.path = '/invoice-items';
