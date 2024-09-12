import multer from "multer";
import { ApiError } from '../utils/ApiError.js';

// Set up storage with Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp/'); // Directory where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

// File filter function
const fileFilter = function (req, file, cb) {
  // Check file type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new ApiError(415, "Unsupported image format."), false);
  }
  
  // Proceed to upload
  cb(null, true);
};

// Initialize Multer with the storage settings and limits
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10 MB limit
  }
});
