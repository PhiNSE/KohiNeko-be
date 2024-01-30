const mongoose = require('mongoose');
const Item = require('./itemModel');

const { Schema } = mongoose;
const invoiceItemSchema = new Schema(
  {
    // invoiceId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'invoices',
    //   required: [true, 'Invoice item must have an invoice'],
    // },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'items',
      validate: {
        validator: async function (v) {
          // const Item = mongoose.model('items');
          const count = await Item.countDocuments({
            _id: v,
            isDeleted: false,
          });
          return count === 1;
        },
        message: function (props) {
          return `Item with id ${props.value} is deleted`;
        },
      },
      required: [true, 'Invoice item must have an item'],
    },
    quantity: {
      type: Number,
      required: [true, 'Invoice item must have a quantity'],
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
  },
  { timestamps: true },
);

invoiceItemSchema.pre('save', async function (next) {
  const itemPrice = await Item.findById(this.itemId).select('price');
  this.totalPrice = this.quantity * itemPrice.price;
  next();
});

module.exports = { invoiceItemSchema };
