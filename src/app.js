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
app.use("/api/v1/users", userRouter);

export default app;
