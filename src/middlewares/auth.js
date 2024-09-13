import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (err, req, res, next) => {
try {
        const token = req.cookies?.acaccessTokenn || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "Unauthorized Request");
    
        };
    
        const decodedInfo = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedInfo?._id).select(" -password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid Jwt AccessToken!")
        };
    
        req.user = user;
        next();
} catch (error) {
    throw new ApiError(401, error.message || "Invalid Access Token!")
}
});
