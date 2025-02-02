import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { X } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch messages when user selected
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (selectedUser?._id) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.data]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-xl text-base-content/50">
          Select a user to start chatting
        </p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const messagesList = Array.isArray(messages?.data) ? messages.data : [];
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesList.length > 0 ? (
          messagesList.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[300px] max-w-[200px] rounded-md mb-2 
      cursor-zoom-in hover:opacity-90 
      transition-all duration-200 
      active:scale-95 hover:shadow-lg
      transform-gpu"
                    onClick={() => {
                      const img = event.target;
                      img.style.transform = "scale(0.95)";
                      setTimeout(() => {
                        img.style.transform = "scale(1)";
                        setSelectedImage(message.image);
                      }, 150);
                    }}
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-base-content/50">
            No messages yet. Start a conversation!
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 
      p-2 sm:p-4
      ${
        isClosing
          ? "animate-out fade-out zoom-out duration-200"
          : "animate-in fade-in zoom-in duration-300"
      }
      ease-out`}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setSelectedImage(null);
              setIsClosing(false);
            }, 200);
          }}
        >
          <div
            className={`relative w-full mx-auto
        max-w-[85%] sm:max-w-lg  // Reduced from xl to lg and 95% to 85%
        ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        transition-all duration-300 ease-out hover:scale-[1.02]`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsClosing(true);
                setTimeout(() => {
                  setSelectedImage(null);
                  setIsClosing(false);
                }, 200);
              }}
              className="absolute -top-2 -right-2 btn btn-circle btn-sm bg-base-100 hover:bg-base-200 
          shadow-lg z-10 transform hover:scale-110 transition-transform duration-200"
            >
              <X className="size-4" />
            </button>
            <div
              className={`bg-base-100 rounded-lg p-1 shadow-xl overflow-hidden
          ${
            isClosing
              ? "animate-out slide-out-to-bottom duration-200"
              : "animate-in slide-in-from-bottom duration-300"
          }`}
            >
              <img
                src={selectedImage}
                alt="Preview"
                className={`w-full h-auto rounded-lg object-contain 
            max-h-[35vh] sm:max-h-[45vh]  // Reduced max height
            ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
            transition-all duration-300 ease-out`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
