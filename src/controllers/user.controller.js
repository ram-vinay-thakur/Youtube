import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import compressAndReplaceImage from "../utils/image-compression.js";

// user.controller.js (without asyncHandler for testing)
const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }
  if (!fullName?.trim()) {
    throw new ApiError(400, "Full name is required");
  }
  if (!password?.trim()) {
    throw new ApiError(400, "Password is required");
  }
  

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  await compressAndReplaceImage(avatarLocalPath, { width: 800, quality: 80 });
  await compressAndReplaceImage(coverImageLocalPath, { width: 800, quality: 80 });

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400, "Avatar upload failed");
  }

  const userSaved = await User.create({
    username:username.toLowerCase(),
    email:email,
    fullName:fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    password:password,
  });

  const savedUserCheck = await User.findById(userSaved._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(200, savedUserCheck, "User Registered Successfully!")
  )
});

export default registerUser;
