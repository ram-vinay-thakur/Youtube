import { Router } from 'express';
import { upload } from '../middlewares/multer.js'; // Import your multer configuration
import { registerUser, loginUser, logOutUser, refreshAccessandRefreshTokens } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.js';

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
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessandRefreshTokens);

export default router;
