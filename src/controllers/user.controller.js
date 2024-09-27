import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { compressAndReplaceImage } from "../utils/image-compression.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  const dataFromClient = {
    username: username?.trim(),
    email: email?.trim(),
    fullName: fullName?.trim(),
    password: password?.trim(),
  };

  // Find the empty fields
  const emptyFields = Object.keys(dataFromClient).filter(key =>
    !dataFromClient[key]
  );

  if (emptyFields.length > 0) {
    const fieldsString = emptyFields.join(', ');
    return next(new ApiError(400, `Please fill in the following fields: ${fieldsString}`));
  }


  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists.");
  }
  console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  await compressAndReplaceImage(avatarLocalPath);
  await compressAndReplaceImage(coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const userSaved = await User.create({
    username: username.toLowerCase(),
    email: email,
    fullName: fullName,
    avatar: [avatar.url, avatar.public_id],
    coverImage: [coverImage?.url || "", coverImage.public_id],
    password: password,
  });

  const savedUserCheck = await User.findById(userSaved._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(201, savedUserCheck, "User Registered Successfully!")
  )
});

const generateAccessandRefreshToken = async (userId) => {
  try {
    const userinDB = await User.findById(userId);
    const accessToken = userinDB.generateAccessToken();
    const refreshToken = userinDB.generateRefreshToken();

    userinDB.refreshToken = refreshToken;
    await userinDB.save({ validateBeforeSave: false })
    const tokens = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
    return tokens;
  } catch (err) {
    throw new ApiError(500, err.message);
  };
};

const loginUser = asyncHandler(async (req, res) => {
  // take eamil and password from req body
  // check if user exists
  // check password
  // access and refresh token generate
  // send cookie
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required!");
  };

  const userSaved = await User.findOne({
    $or: [{ username: username }, { email: email }]
  });

  if (!userSaved) {
    throw new ApiError(404, "User doesn't exists!")
  };

  const isCorrectPassword = await userSaved.isPasswordCorrect(password);

  if (!isCorrectPassword) {
    throw new ApiError(401, "Invalid User Credentials")
  };

  const tokens = await generateAccessandRefreshToken(userSaved._id);
  const { accessToken, refreshToken } = tokens;

  const loggedInUser = await User.findById(userSaved._id).select(" -password -refreshToken");

  const cookieOption = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption)
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken: accessToken,
      refreshToken: refreshToken
    }, "User Logged in Successfully!"
    ))

});

const logOutUser = (req, res) => {
  const user = req.user._id;
  const userinDB = User.findByIdAndUpdate(user,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  );

  const cookieOption = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOption)
    .clearCookie("refreshToken", cookieOption)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"))
};

const refreshAccessandRefreshTokens = asyncHandler(async (req, res) => {
  try {
    const usersRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!usersRefreshToken) {
      throw new ApiError(401, "Unauthorized Request!");
    };

    const decodedToken = jwt.verify(usersRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized Request!");
    };

    if (usersRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Incorrect Refresh Token!")
    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const tokens = await generateAccessandRefreshToken(user?._id);
    const { refreshToken, accessToken } = tokens;
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, 'newRefreshToken': refreshToken },
          "Access Token and Refresh Token renewed Successfully!"
        )
      )
  } catch (error) {
    throw new ApiError(401, "Unauthorized Request!")
  }
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldPasword, newPassword } = req.body;

  const user = User.findById(req.user?._id);
  const passwordCheck = await user.isPasswordCorrect(oldPasword, user.password);
  if (!passwordCheck) {
    throw new ApiError(401, "Incorrect Password!");
  };

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Updated Successfully!"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Retrieved Successfully!"))
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Please fill in all fields!");
  };

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email
      }
    },
    { new: true }
  ).select("-password -refreshToken")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully!"))
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarpath = req.file?.path;
  if (!avatarpath) {
    throw new ApiError(400, "Please upload an image!");
  };

  const avatar = await uploadOnCloudinary(avatarpath);
  if (!avatar.url) {
    throw new ApiError(500, "Failed to upload image to cloudinary!");
  };

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: [avatar.url, avatar.public_id]
      }
    }, { new: true }
  ).select("-password -refreshToken");

  const deletedavatar = await deleteFromCloudinary(user.avatar[1]);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Uploaded Successfully!"))
});

const updatecoverImage = asyncHandler(async (req, res) => {
  const coverImagepath = req.file?.path; // Extract the path of the uploaded file from the request
  if (!coverImagepath) {
    throw new ApiError(400, "Please upload an image!"); // Check if an image was uploaded; if not, throw an error
  }

  const coverImage = await uploadOnCloudinary(coverImagepath); // Upload the image to Cloudinary
  if (!coverImage.url) {
    throw new ApiError(500, "Failed to upload image to cloudinary!"); // Check if the upload was successful
  }

  // Update the user's cover image in the database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: [coverImage.url, coverImage.public_id] // Store the Cloudinary URL and public ID
      }
    }, 
    { new: true } // Return the updated document
  ).select("-password -refreshToken"); // Exclude sensitive fields from the returned user object

  const deleteCoverImage = await deleteFromCloudinary(user.coverImage[1]); // Delete the old cover image from Cloudinary

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Uploaded Successfully!")); // Send a success response
});

const getUserChhanelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "Username is required");
  };

  const user = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()  // Match user by username (case-insensitive)
      }
    },
    {
      $lookup: {
        from: "subscriptions",             // Use the correct collection name for subscriptions
        localField: "_id",
        foreignField: "channel",        // Match where the user is the subscriber
        as: "subscribers"                  // Store the result in the "subscribers" field
      }
    },
    {
      $lookup: {
        from: "subscriptions",             // Again, use the correct collection name
        localField: "_id",
        foreignField: "subscriber",           // Match where the user is the channel
        as: "subscribedTo"                 // Store the result in the "subscribedTo" field
      }
    },
    {
      $addFields: {
        subscriberCount: {                 // Add a field for the count of subscribers
          $size: "$subscribers"            // Count the elements in the "subscribers" array
        },
        channelsSubscribedToCount: {       // Add a field for the count of channels the user is subscribed to
          $size: "$subscribedTo"           // Count the elements in the "subscribedTo" array
        },
        isSubscribed: {
          $cond: {
            if: { $in: [mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatardd: 1,
        coverImage: 1,
        email: 1
      }
    }
  ]);
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessandRefreshTokens,
  getCurrentUser,
  updateAccountDetail,
  updateUserPassword,
  getUserChhanelProfile,
  updateAvatar,
  updatecoverImage
};
