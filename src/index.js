import mongoose from "mongoose";
import connectDB from "./db/connection.js";
import { asyncHandler } from "./utils/asyncHandler.js";

asyncHandler(connectDB);