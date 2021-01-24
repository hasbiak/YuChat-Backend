const multer = require("multer");
const helper = require("../helper");

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, "./uploads/");
  },
  filename: (request, file, callback) => {
    callback(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 200000 },
  fileFilter: (request, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(
        new Error("Only image files are allowed! (jpg/jpeg/png)", false)
      );
    }
    callback(null, true);
  },
}).single("user_image");

const uploadFilter = (request, response, next) => {
  upload(request, response, (error) => {
    if (error instanceof multer.MulterError) {
      return helper.response(response, 400, error.message);
    } else if (error) {
      return helper.response(response, 400, error.message);
    }
    next();
  });
};

module.exports = uploadFilter;
