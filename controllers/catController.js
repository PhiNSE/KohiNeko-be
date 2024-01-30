const ApiResponse = require('../dto/ApiResponse');
const catService = require('../services/catService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const { uploadImage, upload } = require('../utils/firebaseDB');

exports.getAllCats = catchAsync(async (req, res) => {
  const cats = await catService.getAllCats();
  res.send(ApiResponse.success('Get all cats successfully', cats));
});

exports.getCatById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const cat = await catService.getCatById(id);
  if (!cat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Get cat by id successfully', cat));
  }
});

exports.searchCat = catchAsync(async (req, res) => {
  const { keyword } = req.query;
  console.log('keyword', keyword);
  const cats = await catService.searchCat(keyword);
  res.send(res.send(new ApiResponse(200, 'Search cats successfully', cats)));
});

exports.createCat = catchAsync(async (req, res) => {
  const cat = await catService.createCat(req.body);
  res.send(new ApiResponse(200, 'Create cat successfully', cat));
});

exports.updateCat = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCat = await catService.updateCat(id, req.body);
  if (!updatedCat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Update cat successfully', updatedCat));
  }
});

exports.deleteCat = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedCat = await catService.deleteCat(id);
  if (!deletedCat) {
    res.status(404).send(new ApiResponse(404, 'Cat not found', null));
  } else {
    res.send(new ApiResponse(200, 'Delete cat successfully', deletedCat));
  }
});

exports.addImage = [
  upload.single('image'),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const image = req.file;
    const folder = 'cats';

    if (!image) {
      res.status(400).send(new ApiResponse(400, 'Image is required', null));
      return;
    }

    const imageURL = await uploadImage(image, folder);
    if (!imageURL) {
      res.status(500).send(new ApiResponse(500, 'Upload image failed', null));
      return;
    }

    const updatedCat = await catService.addImage(id, imageURL);
    res.send(new ApiResponse(200, 'Upload image successfully', updatedCat));
  }),
];
