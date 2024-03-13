const dotenv = require('dotenv');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const ApiResponse = require('../dto/ApiResponse');
const catchAsync = require('../utils/catchAsync/catchAsync');
const bookingService = require('../services/bookingService');
const invoiceService = require('../services/invoiceService');
const { frontendURL } = require('../utils/appConstant');
const InvoiceService = require('../services/invoiceService');

dotenv.config({ path: './config.env' });

function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key = '';
  // eslint-disable-next-line no-restricted-syntax
  for (key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  // eslint-disable-next-line no-plusplus
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

exports.createPaymentUrl = async (req, res) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = `${frontendURL}/purchase`;
  const { bookingId } = req.params;
  const booking = await bookingService.getBookingById(bookingId);
  let invoiceTotal = 0;
  if (booking.invoices) {
    invoiceTotal = booking.invoices.reduce(
      (acc, cur) => acc + cur.totalPrice,
      0,
    );
  }
  const amount = booking.price + invoiceTotal;
  const { bankCode } = req.body;
  let locale = 'vn';
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  const currCode = 'VND';
  let vnpParams = {};
  vnpParams.vnp_Version = '2.1.0';
  vnpParams.vnp_Command = 'pay';
  vnpParams.vnp_TmnCode = tmnCode;
  vnpParams.vnp_Locale = locale;
  vnpParams.vnp_CurrCode = currCode;
  vnpParams.vnp_TxnRef = bookingId;
  vnpParams.vnp_OrderInfo = `Thanh toan cho ma GD:${bookingId}`;
  vnpParams.vnp_OrderType = 'other';
  vnpParams.vnp_Amount = amount * 100;
  vnpParams.vnp_ReturnUrl = returnUrl;
  vnpParams.vnp_IpAddr = ipAddr;
  vnpParams.vnp_CreateDate = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnpParams.vnp_BankCode = bankCode;
  }
  vnpParams = sortObject(vnpParams);
  //   console.log(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;
  vnpUrl += `?${querystring.stringify(vnpParams, { encode: false })}`;
  res
    .status(200)
    .send(ApiResponse.success('Get payment url successfully', vnpUrl));
};

exports.vnpay_return = catchAsync(async (req, res) => {
  let vnpParams = req.body;
  const secureHash = vnpParams.vnp_SecureHash;
  console.log(secureHash, 'secureHash');
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;
  vnpParams = sortObject(vnpParams);
  // const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  const bookingId = vnpParams.vnp_TxnRef;

  if (secureHash === signed) {
    if (vnpParams.vnp_ResponseCode === '00') {
      const booking = await bookingService.updateStatus(bookingId, 'pending');
      console.log(booking);
      if (booking.invoices) {
        await invoiceService.updateStatus(booking.invoices, 'paid');
      }
      res.status(200).json({
        status: 'success',
        data: {
          message: 'payment success',
        },
      });
    } else {
      const booking = await bookingService.updateStatus(bookingId, 'unpaid');
      if (booking.invoices) {
        await invoiceService.updateStatus(booking.invoices, 'unpaid');
      }
      res.status(200).json({
        status: 'fail',
        data: {
          message: 'payment fail',
        },
      });
    }
  } else {
    const booking = await bookingService.updateStatus(bookingId, 'unpaid');
    if (booking.invoices) {
      await invoiceService.updateStatus(booking.invoices, 'unpaid');
    }
    res.status(200).json({
      status: 'fail',
      data: {
        message: 'payment fail',
      },
    });
  }
});

exports.createRefundUrl = async (req, bookingId, amount) => {
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
  const returnUrl = 'http://localhost:8000/vnPay/return';

  console.log(`Refund for ${bookingId} amount:  ${amount}`);
  // let locale = req.body.language;
  // if (locale === null || locale === '') {
  //   locale = 'vn';
  // }
  const currCode = 'VND';
  let vnpParams = {};
  vnpParams.vnp_RequestId = moment().format('YYYYMMDDHHmmss');
  vnpParams.vnp_Version = '2.1.0';
  vnpParams.vnp_Command = 'refund';
  vnpParams.vnp_TmnCode = tmnCode;
  vnpParams.vnp_TransactionType = '03';
  vnpParams.vnp_TxnRef = bookingId;
  vnpParams.vnp_Amount = amount * 100;
  // vnpParams.vnp_Locale = locale;
  vnpParams.vnp_CurrCode = currCode;
  vnpParams.vnp_OrderInfo = `Hoan tien cho ma GD`;
  vnpParams.vnp_TransactionDate = createDate;
  vnpParams.vnp_CreateBy = 'Customer';
  vnpParams.vnp_CreateDate = createDate;
  vnpParams.vnp_ReturnUrl = returnUrl;
  vnpParams.vnp_IpAddr = ipAddr;

  vnpParams = sortObject(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;
  vnpUrl += `?${querystring.stringify(vnpParams, { encode: false })}`;
  console.log(vnpUrl);

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    body: {},
  };

  const response = await fetch(vnpUrl, options);
  console.log('status: ', response.status);
  return response;
};
//Use for invoice offline
exports.createInvoicePaymentUrl = async (req, res) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = `${frontendURL}/staff/booking/${req.params.bookingId}`;
  // const returnUrl = `http://localhost:8000/vnPay/${req.params.bookingId}/invoice_offline/return`;
  const { bookingId } = req.params;
  const invoice = req.body;
  invoice.staffId = req.user._id;
  invoice.coffeeShopId = req.user.coffeeShopId;
  invoice.bookingId = bookingId;
  invoice.status = 'unpaid';

  const booking = await bookingService.getBookingById(bookingId);
  // console.log(booking);
  invoice.userId = booking.customerId;
  const invoiceResult = await InvoiceService.createInvoice(invoice);
  if (invoiceResult) {
    await bookingService.updateInvoiceBooking(invoiceResult);
  }

  // let invoiceTotal = 0;

  const amount = invoiceResult.totalPrice;

  const { bankCode } = req.body;
  let locale = 'vn';
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  const currCode = 'VND';
  let vnpParams = {};
  vnpParams.vnp_Version = '2.1.0';
  vnpParams.vnp_Command = 'pay';
  vnpParams.vnp_TmnCode = tmnCode;
  vnpParams.vnp_Locale = locale;
  vnpParams.vnp_CurrCode = currCode;
  vnpParams.vnp_TxnRef = invoiceResult._id;
  vnpParams.vnp_OrderInfo = `Thanh toan cho ma GD:${invoiceResult._id}`;
  vnpParams.vnp_OrderType = 'other';
  vnpParams.vnp_Amount = amount * 100;
  vnpParams.vnp_ReturnUrl = returnUrl;
  vnpParams.vnp_IpAddr = ipAddr;
  vnpParams.vnp_CreateDate = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnpParams.vnp_BankCode = bankCode;
  }
  vnpParams = sortObject(vnpParams);
  //   console.log(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;
  vnpUrl += `?${querystring.stringify(vnpParams, { encode: false })}`;
  res
    .status(200)
    .send(ApiResponse.success('Get payment url successfully', vnpUrl));
};

exports.vnpay_return_invoice_offline = catchAsync(async (req, res) => {
  console.log('asdasd');
  let vnpParams = req.query;
  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;
  console.log(vnpParams);

  vnpParams = sortObject(vnpParams);
  console.log(vnpParams);
  // const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET;
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  // console.log(hmac);

  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  const invoiceId = vnpParams.vnp_TxnRef;
  // console.log(vnpParams.vnp_ResponseCode);
  console.log(secureHash, 'secureHash');
  console.log(signed, 'signed');

  if (secureHash === signed) {
    if (vnpParams.vnp_ResponseCode === '00') {
      // console.log(invoiceId);
      await invoiceService.updateStatus(invoiceId, 'paid');

      res.status(200).json({
        status: 'success',
        data: {
          message: 'payment success',
        },
      });
    } else {
      await invoiceService.updateStatus(invoiceId, 'unpaid');
      res.status(200).json({
        status: 'fail',
        data: {
          message: 'payment fail',
        },
      });
    }
  } else {
    await invoiceService.updateStatus(invoiceId, 'unpaid');
    res.status(200).json({
      status: 'fail',
      data: {
        message: 'payment fail',
      },
    });
  }
});
