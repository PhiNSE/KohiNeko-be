const router = require('express').Router();
const otpController = require('../controllers/otpController');

router.post('/send-otp', otpController.sendOtp);
router.post('/verify-otp', otpController.verifyOtp);

module.exports = router;
