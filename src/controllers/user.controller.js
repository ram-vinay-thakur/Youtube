import asyncHandler  from "../utils/asyncHandler.js";

// user.controller.js (without asyncHandler for testing)
const registerUser = asyncHandler(async (req, res, next) => {
  return res.status(200).json({
      message: "devraj lele bhai!",
  });
});

export default registerUser;
