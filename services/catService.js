const catModel = require('../models/catModel');

exports.getAllCats = () => catModel.find({ isDeleted: false });

exports.getCatById = (id) => catModel.findOne({ _id: id, isDeleted: false });

exports.searchCat = (keyword, coffeeShopId, areaId) =>
  catModel
    .find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { origin: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { favorite: { $regex: keyword, $options: 'i' } },
      ],
      $and: [
        { $or: [!coffeeShopId, { coffeeShopId }] },
        {
          $or: [
            !areaId,
            {
              $and: [
                { 'areaCats.areaId': areaId },
                {
                  'areaCats.isDeleted': false,
                },
                { 'areaCats.startTime': { $lte: Date.now() } },
                {
                  $or: [
                    { 'areaCats.endTime': { $gte: Date.now() } },
                    { 'areaCats.endTime': null },
                  ],
                },
              ],
            },
          ],
        },
      ],
      isDeleted: false,
    })
    .populate('areaCats')
    .populate('coffeeShopId');

exports.createCat = (cat) => catModel.create(cat);

exports.updateCat = (id, cat) =>
  catModel.findByIdAndUpdate(id, cat, { new: true });

exports.deleteCat = (id) =>
  catModel.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

exports.addImage = async (id, imageURL) => {
  const cat = await catModel.findById(id);
  cat.images.push(imageURL);
  return cat.save();
};
