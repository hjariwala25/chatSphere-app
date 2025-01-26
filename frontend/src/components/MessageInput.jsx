import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";
import { Image } from "lucide-react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";


const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef();
  const { sendMessage, selectedUser } = useChatStore();

  //  compression options
const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 800,
    useWebWorker: true,
    initialQuality: 0.7,
    fileType: "image/jpeg"
  };
  try {
    const compressedFile = await imageCompression(file, options);
    if (compressedFile.size > 1 * 1024 * 1024) {
      throw new Error("Image still too large after compression");
    }
    return compressedFile;
  } catch (error) {
    throw new Error("Error compressing image: " + error.message);
  }
};

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("File size should be less than 5MB");
    return;
  }

  try {
    setIsSending(true);
    const compressedFile = await compressImage(file);
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    
    reader.onload = () => {
      const base64String = reader.result;
      // Validate final size
      if (base64String.length > 1024 * 1024) { 
        toast.error("Image still too large after compression");
        return;
      }
      setImagePreview(base64String);
    };
  } catch (error) {
    console.error("Image processing error:", error);
    toast.error(error.message || "Error processing image");
  } finally {
    setIsSending(false);
  }
};

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error("Please select a user to send message");
      return;
    }

    if (!text.trim() && !imagePreview) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      setIsSending(true);
      const messageData = {
        receiverId: selectedUser._id,
        text: text.trim(),
        image: imagePreview,
      };

      const response = await sendMessage(messageData);
      
      if (response) {
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <form onSubmit={handleSendMessage} className="p-2 bg-base-200">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`hidden sm:flex btn btn-circle
            ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
        >
          <Image className="size-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-base-100 rounded-full px-4 py-2 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isSending || (!text.trim() && !imagePreview)}
          className="btn btn-circle btn-primary btn-sm"
        >
          {isSending ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Send className="size-5" />
          )}
        </button>
      </div>
    </form>
  );};

export default MessageInput;
