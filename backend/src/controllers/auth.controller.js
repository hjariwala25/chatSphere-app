import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/gentoken.js";
import { cloudinary } from "../utils/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    // console.log("Request body", req.body);

    if (!fullName || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    if (typeof password !== "string" || password.length < 6) {
      throw new ApiError(
        400,
        "Password must be a string with at least 6 characters"
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    const userData = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    };

    // Send success response
    return res
      .status(201)
      .json(new ApiResponse(201, userData, "User created successfully"));
  } catch (error) {
    console.error("Error in signup controller", error.message);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", [error.message]));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "Invalid user credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new ApiError(404, "Invalid user credentials")
    }

    generateToken(user._id, res);

    return res.status(200).json(
      new ApiResponse(200, {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      })
    );
  } catch (error) {
    console.error("Error in login controller", error.message);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", [error.message]));
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully  "));
  } catch (error) {
    console.error("Error in logout controller", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", [error.message]));
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      throw new ApiError(400, "Profile picture is required");
    }

    const uploadPicture = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadPicture.secure_url },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
  } catch (error) {
    console.error("Error in updateProfile controller", error.message);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors,
      });
    }
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", [error.message]));
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server error", [error.message]));
  }
};
