import multer from "multer";

// Set up storage with Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    }
  });
  
  // Initialize Multer with the storage settings
export const upload = multer({ storage: storage });
  