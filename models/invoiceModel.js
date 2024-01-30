const mongoose = require('mongoose');
const { invoiceItemSchema } = require('./invoiceItemModel');

const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Invoice must have a user'],
    },
    coffeeShopId: {
      type: Schema.Types.ObjectId,
      ref: 'coffee_shops',
      required: [true, 'Invoice must have a coffee shop'],
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'bookings',
      required: [true, 'Invoice must have a booking'],
    },
    totalPrice: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    invoiceItems: [invoiceItemSchema],
  },
  { timestamps: true },
);

const Invoice = mongoose.model('invoices', invoiceSchema);

module.exports = Invoice;
