const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const TokenBlackList = mongoose.model('TokenBlackList', tokenBlackListSchema);
module.exports = TokenBlackList;
