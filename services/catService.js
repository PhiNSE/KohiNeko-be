const catModel = require('../models/catModel');
const { uploadImage, deleteImage } = require('../utils/firebaseDB');
const AppError = require('../utils/appError');
// const areaCatService = require('./areaCatService');

exports.getAllCats = () =>
  catModel
    .find({ isDeleted: false })
    // .populate({
    //   path: 'catStatus',
    //   select: 'statusId startTime endTime',
    //   options: { sort: { createdAt: -1 } },
    //   populate: { path: 'statusId', select: 'name' },
    // })
    .populate({
      path: 'areaCats',
      select: 'startTime endTime areaId',
      options: { sort: { startTime: -1 } },
      populate: { path: 'areaId', select: 'name isChildAllowed' },
    });

exports.getAllCatsByCoffeeShopId = (coffeeShopId, page, perPage, key, sort) => {
  if (key === undefined) key = '';
  return (
    catModel
      .find({
        coffeeShopId,
        $or: [
          { name: { $regex: key, $options: 'i' } },
          { origin: { $regex: key, $options: 'i' } },
          { description: { $regex: key, $options: 'i' } },
          { favorite: { $regex: key, $options: 'i' } },
        ],
        isDeleted: false,
      })
      .sort(sort)
      .skip((page - 1) * perPage)
      .populate({
        path: 'areaCats',
        select: 'startTime endTime areaId',
        options: { sort: { startTime: -1 } },
        populate: { path: 'areaId', select: 'name isChildAllowed' },
      })
      // .populate({
      //   path: 'catStatus',
      //   select: 'statusId startTime endTime',
      //   options: { sort: { createdAt: -1 } },
      //   populate: { path: 'statusId', select: 'name' },
      // })
      .limit(perPage)
  );
};
exports.getCatById = (id) =>
  catModel
    .findOne({ _id: id, isDeleted: false })
    .populate({
      path: 'areaCats',
      select: 'startTime endTime areaId',
      options: { sort: { startTime: -1 } },
      populate: { path: 'areaId', select: 'name isChildAllowed' },
    })
    // .populate({
    //   path: 'catStatus',
    //   select: 'statusId startTime endTime',
    //   options: { sort: { createdAt: -1 } },
    //   populate: { path: 'statusId', select: 'name' },
    // })
    .populate('coffeeShopId');

exports.searchCat = async (
  name,
  origin,
  description,
  favorite,
  coffeeShopId,
  areaId,
  status,
) => {
  const query = {
    isDeleted: false,
  };

  if (name) query.name = { $regex: name, $options: 'i' };
  if (origin) query.origin = { $regex: origin, $options: 'i' };
  if (description) query.description = { $regex: description, $options: 'i' };
  if (favorite) query.favorite = { $regex: favorite, $options: 'i' };
  // query.$or = [
  //   { name: { $regex: name || '', $options: 'i' } },
  //   { origin: { $regex: origin || '', $options: 'i' } },
  //   { description: { $regex: description || '', $options: 'i' } },
  //   { favorite: { $regex: favorite || '', $options: 'i' } },
  // ];

  if (coffeeShopId) {
    query.coffeeShopId = coffeeShopId;
  }
  if (status) {
    query.status = status;
  }

  const cats = await catModel.find(query).populate({
    path: 'areaCats',
    select: 'startTime endTime areaId',
    options: { sort: { startTime: -1 } },
    populate: { path: 'areaId', select: 'name isChildAllowed' },
  });
  if (areaId) {
    return cats.filter((cat) => {
      for (let i = 0; i < cat.areaCats.length; i += 1) {
        const areaCat = cat.areaCats[i];
        console.log(areaCat.areaId._id.toString());
        console.log(areaId);
        if (areaCat.areaId._id.toString() === areaId) {
          return true;
        }
      }
      return false;
    });
  }

  return cats;
};

exports.getCatByAreaId = async (coffeeShopId, areaId) => {
  const now = Date.now();
  const cats = await catModel
    .find({ coffeeShopId, isDeleted: false })
    .populate('areaCats');
  return cats.filter((cat) => {
    let isNowArea = false;
    for (let i = 0; i < cat.areaCats.length; i += 1) {
      const areaCat = cat.areaCats[i];
      if (
        areaCat.areaId.toString() === areaId &&
        areaCat.startTime <= now &&
        (areaCat.endTime >= now || areaCat.endTime === null)
      ) {
        isNowArea = true;
      }
    }
    return isNowArea;
  });
};

exports.createCat = (cat) => catModel.create(cat);

exports.updateCat = (id, cat) =>
  catModel.findByIdAndUpdate(id, cat, { new: true });

exports.deleteCat = (id) =>
  catModel.findByIdAndUpdate({ _id: id }, { isDeleted: true }, { new: true });

exports.addImages = async (id, images) => {
  const cat = await catModel.findById(id);
  if (!cat) throw new AppError('Cat not found', 404);
  const folder = `cats/${id}`;
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  const imageURLs = await Promise.allSettled(
    images.map((image) => uploadImage(image, folder)),
  );
  imageURLs.forEach((result) => {
    if (result.status === 'fulfilled') {
      cat.images.push({ name: 'image', url: result.value });
    }
  });
  return cat.save();
};

exports.addAvatar = async (id, image) => {
  const cat = await catModel.findById(id);
  if (!cat) throw new AppError('Cat not found', 404);
  const folder = `cats/${id}`;
  const imageURL = await uploadImage(image, folder);
  if (!imageURL) throw new AppError('Upload image failed', 500);
  cat.images.push({ name: 'avatar', url: imageURL });
  return cat.save();
};

exports.deleteImage = async (catId, imageId) => {
  const cat = await catModel.findById(catId);
  if (!cat) throw new AppError('Cat not found', 404);

  const image = cat.images.id(imageId);
  if (!image) {
    throw new AppError('Image not found', 404);
  }
  cat.images.pull(image._id);
  deleteImage(image.url);

  return cat.save();
};
