const areaService = require('../services/areaService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const { uploadImage, upload } = require('../utils/firebaseDB');
const ApiResponse = require('../dto/ApiResponse');

exports.getAllAreas = catchAsync(async (req, res) => {
  const { coffeeShopId } = req.query;
  const areas = await areaService.getAllAreas(coffeeShopId);
  res.send(ApiResponse.success('Get all areas successfully', areas));
});

exports.getAreaById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const area = await areaService.getAreaById(id);
  if (!area) {
    res.status(404).send(new ApiResponse(404, 'Area not found', null));
  } else {
    res.send(ApiResponse.success('Get area by id successfully', area));
  }
});

exports.createArea = catchAsync(async (req, res) => {
  const area = await areaService.createArea(req.body);
  res.send(ApiResponse.success('Create area successfully', area));
});

exports.updateArea = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedArea = await areaService.updateArea(id, req.body);
  if (!updatedArea) {
    res.status(404).send(new ApiResponse(404, 'Area not found', null));
  } else {
    res.send(ApiResponse.success('Update area successfully', updatedArea));
  }
});

exports.deleteArea = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedArea = await areaService.deleteArea(id);
  if (!deletedArea) {
    res.status(404).send(new ApiResponse(404, 'Area not found', null));
  } else {
    res.send(ApiResponse.success('Delete area successfully', deletedArea));
  }
});

exports.addImage = [
  upload.single('image'),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const image = req.file;
    const folder = 'areas';

    if (!image) {
      res.status(400).send(new ApiResponse(400, 'Image is required', null));
    } else {
      const imageURL = await uploadImage(image, folder);
      const updatedArea = await areaService.addImage(id, imageURL);
      res.send(ApiResponse.success('Add image successfully', updatedArea));
    }
  }),
];
