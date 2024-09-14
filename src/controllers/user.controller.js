import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { compressAndReplaceImage } from "../utils/image-compression.js";

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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

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
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password: password,
  });

  const savedUserCheck = await User.findById(userSaved._id).select(
    "-password -refreshToken"
  );

  return res.status(201).json(
    new ApiResponse(200, savedUserCheck, "User Registered Successfully!")
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
  console.log(accessToken, refreshToken)

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
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
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
}


export {
  registerUser,
  loginUser,
  logOutUser
};
