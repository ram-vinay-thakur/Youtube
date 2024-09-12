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

const fileFilter = function (req, file, cb) {
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(415).json({ message: "Unsupported image format." });
  }
  return true;
}
// Initialize Multer with the storage settings
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits:{
    fileSize: 1024 * 1024 * 10 // 5MB
  }
});
