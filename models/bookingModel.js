const mongoose = require('mongoose');
const TableType = require('./tableTypeModel');
const Table = require('./tableModel');

const bookingSchema = new mongoose.Schema(
  {
    coffeeShopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coffee_shops',
      required: [true, 'Booking must have a coffee shop'],
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tables',
      required: [true, 'Booking must have a table'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    invoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'invoices',
      },
    ],
    price: {
      type: Number,
      required: false,
    },
    startTime: {
      type: Date,
      required: [true, 'Booking must have a start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Booking must have an end time'],
    },
    status: {
      type: String,
      default: 'active',
    },
    refundMakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    refundReason: {
      type: String,
      required: false,
    },
    refundPercent: {
      type: Number,
      required: false,
    },
    refundAmount: {
      type: Number,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

bookingSchema.pre('save', async function (next) {
  const table = await Table.Table.findById(this.tableId).select('tableTypeId');
  const tableType = await TableType.TableType.findById(
    table.tableTypeId,
  ).select('price');
  const durationInMinutes = (this.endTime - this.startTime) / (1000 * 60);
  const durationInHours = durationInMinutes / 60;
  this.price = tableType.price * durationInHours;
  next();
});

const Booking = mongoose.model('bookings', bookingSchema);
module.exports = Booking;
