import express, { json } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

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
    console.error(err.stack); // Log the error details to the console (or to a file)

    // Send a response to the client
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Include stack trace only in development
    });
});

export default app;
