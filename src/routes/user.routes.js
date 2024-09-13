import { Router } from 'express';
import { upload } from '../middlewares/multer.js'; // Import your multer configuration
import { registerUser } from '../controllers/user.controller.js';

const userRouter = Router();

// Apply multer middleware for handling file uploads
userRouter.route('/register').post(upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }, {
        name: 'coverImage',
        maxCount: 1
    }
]),
    registerUser);

export default userRouter;
