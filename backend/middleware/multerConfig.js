const multer = require("multer");

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and GIF files are allowed"));
  }
  cb(null, true);
};

module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
});
