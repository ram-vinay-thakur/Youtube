import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

// user.controller.js (without asyncHandler for testing)
const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  if (
    [username, email, fullName, password].some((data) => data?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are Required");
  }

  const existingUser = User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400, "Avatar upload failed");
  }

  const userSaved = await User.create({
    fullName,
    email,
    username:username.toLowerCase(),
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url || ""
  });

  const savedUserCheck = await User.findById(userSaved._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(200, savedUserCheck, "User Registered Successfully!")
  )
});

export default registerUser;
