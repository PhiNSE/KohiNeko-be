const { uploadImage, upload } = require('../utils/firebaseDB');
const ApiResponse = require('../dto/ApiResponse');
const catchAsync = require('../utils/catchAsync/catchAsync');

exports.uploadImage = [
  upload.single('image'),
  catchAsync(async (req, res) => {
    const image = req.file;
    const folder = 'static';

    if (!image) {
      res.status(400).send(new ApiResponse(400, 'Image is required', null));
      return;
    }

    const imageURL = await uploadImage(image, folder);
    if (!imageURL) {
      res.status(500).send(new ApiResponse(500, 'Upload image failed', null));
      return;
    }
    res.send(new ApiResponse(200, 'Upload image successfully', imageURL));
  }),
];
