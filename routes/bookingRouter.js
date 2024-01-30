const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .post(authMiddleware.verifyToken, bookingController.createBooking)
  .get(bookingController.getAllBooking);
router.route('/:id').get(bookingController.getBookingById);

router.route('/available-time').post(bookingController.getAllAvailableTime);
router.route('/day').get(bookingController.getAllBookingInDay);

exports.router = router;
exports.path = '/bookings';
