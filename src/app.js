import express, { json } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import multer from "multer";

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

app.use(json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
import userRouter from './routes/user.routes.js';
console.log('route done')
app.use("/api/v1/users", userRouter);
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
                message: 'File exceeds the maximum size limit of 10MB.' 
            });
        }
        return res.status(400).json({ message: err.message });
    }

    // Handle other errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // General error handling
    return res.status(500).json({ message: 'An unexpected error occurred.' });
});


export default app;
