import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new ApiError(401, "Unauthorized request - no token found");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      throw new ApiError(401, "Unauthorized request - invalid token");
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware", error.message);
    if(error instanceof ApiError){
        return res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message,
            success: false,
            errors: error.errors
        })
    }
    res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
};
