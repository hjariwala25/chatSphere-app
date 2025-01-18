import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    return res.status(200).json(new ApiResponse(200, filteredUsers));
    
  } catch (error) {
    console.error("Error in getUsersForSidebar controller", error.message);
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

export const getMessages = async (req, res) => {
    try {
      const{id:userToChatId} = req.params
      const myId = req.user._id
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      })

      return res.status(200).json(new ApiResponse(200, messages));


    } catch (error) {
      console.error("Error in getMessages controller", error.message);
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
}

export const sendMessages = async (req, res) => {
  try {
    const {text, image} = req.body
    const {id:receiverId} = req.params
    const senderId = req.user._id
    let imageUrl
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    await newMessage.save()

    return res.status(201).json(new ApiResponse(201, newMessage));

  } catch (error) {
    console.error("Error in sendMessages controller", error.message);
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
}
