const ApiResponse = require('../dto/ApiResponse');
const catService = require('../services/catService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const { upload } = require('../utils/firebaseDB');

exports.getAllCats = catchAsync(async (req, res) => {
  const cats = await catService.getAllCats();
  res.send(ApiResponse.success('Get all cats successfully', cats));
});

exports.getAllCatsByCoffeeShopId = catchAsync(async (req, res) => {
  const coffeeShopId = req.params.id;
  let { page, perPage } = req.query;
  const { key, sort } = req.query;
  if (page === undefined) page = 1;
  if (perPage === undefined) perPage = 10;
  const cats = await catService.getAllCatsByCoffeeShopId(
    coffeeShopId,
    page,
    perPage,
    key,
    sort,
  );
  res.send(
    new ApiResponse(200, 'Get all cats by coffee shop id successfully', cats),
  );
});

exports.getCatById = catchAsync(async (req, res) => {
  const { catId } = req.params;
  const cat = await catService.getCatById(catId);
  if (!cat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Get cat by id successfully', cat));
  }
});

exports.getCatByAreaId = catchAsync(async (req, res) => {
  const coffeeShopId = req.params.id;
  const { areaId } = req.params;
  const cats = await catService.getCatByAreaId(coffeeShopId, areaId);
  res.send(new ApiResponse(200, 'Get cat by area id successfully', cats));
});

exports.searchCat = catchAsync(async (req, res) => {
  const coffeeShopId = req.params.id;
  const { name, origin, description, favorite, areaId, status } = req.query;
  const cats = await catService.searchCat(
    name,
    origin,
    description,
    favorite,
    coffeeShopId,
    areaId,
    status,
  );
  res.send(new ApiResponse(200, 'Search cats successfully', cats));
});

exports.createCat = catchAsync(async (req, res) => {
  const cat = await catService.createCat(req.body);
  res.send(new ApiResponse(200, 'Create cat successfully', cat));
});

exports.updateCat = catchAsync(async (req, res) => {
  const { catId } = req.params;
  const updatedCat = await catService.updateCat(catId, req.body);
  if (!updatedCat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Update cat successfully', updatedCat));
  }
});

exports.deleteCat = catchAsync(async (req, res) => {
  const { catId } = req.params;
  const deletedCat = await catService.deleteCat(catId);
  if (!deletedCat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Delete cat successfully', deletedCat));
  }
});

exports.addImages = [
  upload.fields([{ name: 'images' }]),
  catchAsync(async (req, res) => {
    const { catId } = req.params;
    const images = req.files;

    if (!images || !images.images) {
      return res
        .status(400)
        .send(new ApiResponse(400, 'Images is required', null));
    }

    const updatedCat = await catService.addImages(catId, images.images);
    res.send(new ApiResponse(200, 'Upload image successfully', updatedCat));
  }),
];

exports.deleteImage = catchAsync(async (req, res) => {
  const { catId, imageId } = req.params;
  const updatedCat = await catService.deleteImage(catId, imageId);
  res.send(new ApiResponse(200, 'Delete image successfully', updatedCat));
});
