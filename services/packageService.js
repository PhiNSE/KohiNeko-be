const packageModel = require('../models/packageModel');

exports.getAllPackages = () => packageModel.find({ isDeleted: false });

exports.getPackageById = (id) =>
  packageModel.findOne({ _id: id, isDeleted: false });

exports.createPackage = (package) => packageModel.create(package);

exports.updatePackage = (id, package) =>
  packageModel.findByIdAndUpdate(id, package, { new: true });

exports.deletePackage = (id) =>
  packageModel.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true },
  );
