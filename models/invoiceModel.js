const mongoose = require('mongoose');
const { invoiceItemSchema } = require('./invoiceItemModel');

const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
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
      default: 'unpaid',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    invoiceItems: [invoiceItemSchema],
  },
  { timestamps: true },
);

invoiceSchema.pre('save', async function (next) {
  this.totalPrice = this.invoiceItems.reduce(
    (acc, cur) => acc + cur.totalPrice,
    0,
  );
  next();
});
const Invoice = mongoose.model('invoices', invoiceSchema);

module.exports = Invoice;
