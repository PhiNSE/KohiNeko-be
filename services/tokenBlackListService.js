const tokenBlackListModel = require('../models/tokenBlackListModel');

exports.saveToken = async (token) =>
  await tokenBlackListModel.create({ token });
