const catchAsync = require('../utils/catchAsync/catchAsync');
const ApiResponse = require('../dto/ApiResponse');

const tabelTypeService = require('../services/tableTypeService');

exports.getAllTableTypes = catchAsync(async (req, res) => {
  const tableTypes = await tabelTypeService.getAllTableTypes();
  res.send(
    new ApiResponse(200, 'Get all table types successfully', tableTypes),
  );
});

exports.getTableTypeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const tableType = await tabelTypeService.getTableTypeById(id);
  if (!tableType) {
    res.status(404).send(new ApiResponse(404, 'Table type not found', null));
  } else {
    res.send(
      new ApiResponse(200, 'Get table type by id successfully', tableType),
    );
  }
});

exports.createTableType = catchAsync(async (req, res) => {
  const tableType = await tabelTypeService.createTableType(req.body);
  res.send(new ApiResponse(200, 'Create table type successfully', tableType));
});

exports.updateTableType = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedTableType = await tabelTypeService.updateTableType(id, req.body);
  if (!updatedTableType) {
    res.status(404).send(new ApiResponse(404, 'Table type not found', null));
  } else {
    res.send(
      new ApiResponse(200, 'Update table type successfully', updatedTableType),
    );
  }
});

exports.deleteTableType = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedTableType = await tabelTypeService.deleteTableType(id);
  if (!deletedTableType) {
    res.status(404).send(new ApiResponse(404, 'Table type not found', null));
  } else {
    res.send(
      new ApiResponse(200, 'Delete table type successfully', deletedTableType),
    );
  }
});

exports.getTableTypeByNumberOfPeople = catchAsync(async (req, res) => {
  const { numberOfPeople } = req.params;
  const tableType =
    await tabelTypeService.getTableTypeByNumberOfPeople(numberOfPeople);
  if (!tableType) {
    res.status(404).send(new ApiResponse(404, 'Table type not found', null));
  } else {
    res.send(
      new ApiResponse(
        200,
        'Get table type by number of people successfully',
        tableType,
      ),
    );
  }
});
