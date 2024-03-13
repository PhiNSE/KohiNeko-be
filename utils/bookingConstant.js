exports.bookingStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUND: 'refund',
  PENDING: 'pending',
};

exports.customerRefundPenalty = {
  MAX_TIME: 24 * 60 * 60 * 1000, // 24 hours
  PENALTY: 0.5,
};
