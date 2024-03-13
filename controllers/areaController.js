const areaService = require('../services/areaService');
const catchAsync = require('../utils/catchAsync/catchAsync');
const { upload } = require('../utils/firebaseDB');
const BookingService = require('../services/bookingService');
const ApiResponse = require('../dto/ApiResponse');

const convertToTime = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds);
  return date;
};

exports.getAllAreas = catchAsync(async (req, res) => {
  let { keyword } = req.params;
  const { coffeeShopId } = req.params;
  if (!coffeeShopId) {
    res
      .status(400)
      .send(new ApiResponse(400, 'Coffee shop id is required', null));
    return;
  }
  if (keyword === undefined) {
    keyword = '';
  }
  console.log(coffeeShopId, keyword);
  const areas = await areaService.getAllAreas(coffeeShopId, keyword);
  res.send(ApiResponse.success('Get all areas successfully', areas));
});

exports.getAreaById = catchAsync(async (req, res) => {
  const { areaId } = req.params;
  const area = await areaService.getAreaById(areaId);
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
  const { areaId } = req.params;
  const updatedArea = await areaService.updateArea(areaId, req.body);
  if (!updatedArea) {
    res.status(404).send(new ApiResponse(404, 'Area not found', null));
  } else {
    res.send(ApiResponse.success('Update area successfully', updatedArea));
  }
});

exports.deleteArea = catchAsync(async (req, res) => {
  const { areaId } = req.params;
  const deletedArea = await areaService.deleteArea(areaId);
  if (!deletedArea) {
    res.status(404).send(new ApiResponse(404, 'Area not found', null));
  } else {
    res.send(ApiResponse.success('Delete area successfully', deletedArea));
  }
});

exports.addImage = [
  upload.single('image'),
  catchAsync(async (req, res) => {
    const { areaId } = req.params;
    const image = req.file;

    if (!image) {
      res.status(400).send(new ApiResponse(400, 'Image is required', null));
      return;
    }
    const updatedArea = await areaService.addImage(areaId, image);
    res.send(ApiResponse.success('Add image successfully', updatedArea));
  }),
];

exports.deleteImage = catchAsync(async (req, res) => {
  const { areaId, imageId } = req.params;
  const updatedCat = await areaService.deleteImage(areaId, imageId);
  res.send(new ApiResponse(200, 'Delete image successfully', updatedCat));
});

exports.getTableTypeInArea = catchAsync(async (req, res) => {
  const { startTime, endTime, date } = req.query;
  const { areaId } = req.params;

  const dateGet = new Date(date);
  dateGet.setHours(0, 0, 0, 0);
  const startTimeDate = convertToTime(startTime);
  const endTimeDate = convertToTime(endTime);

  const startTimeDateInDateTime = dateGet.setHours(
    startTimeDate.getHours(),
    startTimeDate.getMinutes(),
    0,
    0,
  );

  const endTimeDateInDateTime = dateGet.setHours(
    endTimeDate.getHours(),
    endTimeDate.getMinutes(),
    0,
    0,
  );

  console.log(areaId, startTimeDateInDateTime, endTimeDateInDateTime);
  const area = await areaService.getAreaById(areaId);
  const tableBooked = await BookingService.getAllBookingInDateInArea(
    startTimeDateInDateTime,
    endTimeDateInDateTime,
    area,
    area.coffeeShopId,
  );

  const tableTypes = await areaService.getTableTypesInArea(areaId);
  tableTypes.forEach((tableType) => {
    tableType.bookedTable = tableBooked.filter(
      (booking) =>
        booking.table &&
        booking.table.tableTypeId &&
        booking.table.tableTypeId.toString() ===
          tableType.tableTypeId.toString(),
    ).length;
  });
  console.log(tableTypes);
  console.log(tableBooked);
  res.send(
    ApiResponse.success('Get table types in area successfully', tableTypes),
  );
});
