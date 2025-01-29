import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ 
        messages: {
          ...res.data,
          data: Array.isArray(res.data.data) ? res.data.data : []
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messages: { data: [] } });
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages  } = get(); 
    if (!selectedUser?._id) {
      toast.error("Please select a user to send message");
      return;
    }

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      const newMessage = res.data.data;
      if (newMessage) {
        // Update messages immediately after sending
        set({
          messages: {
            ...messages,
            data: [...(messages?.data || []), newMessage]
          }
        });

        // Emit socket event if user is online
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.emit("newMessage", newMessage);
        }
        return newMessage;
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },  
   
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;
  
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
  
    socket.on("newMessage", (newMessage) => {
      const isChatParticipant = 
        newMessage.senderId === selectedUser._id || 
        newMessage.receiverId === selectedUser._id;
  
      if (isChatParticipant) {
        set((state) => ({
          messages: {
            ...state.messages,
            data: [...(state.messages?.data || []), newMessage]
          }
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
