import { Router } from 'express';
import { upload } from '../middlewares/multer.js'; // Import your multer configuration
import { registerUser, loginUser, logOutUser, refreshAccessandRefreshTokens } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const router = Router();

// Apply multer middleware for handling file uploads
router.route('/register').post(upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }, {
        name: 'coverImage',
        maxCount: 1
    }
]),
    registerUser
);
router.route('/register').get((req, res) => {
    // Send the index.html file from the public/html folder
    const htmlFilePath = path.join(__dirname, '../../public/html/index.html');
    res.sendFile(htmlFilePath);
});
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessandRefreshTokens);

export default router;
