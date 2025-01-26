import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

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
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messages: { data: [] } }); // empty array
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages = [] } = get(); 
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
        set({ messages: Array.isArray(messages) ? [...messages, newMessage] : [newMessage] });
        return newMessage;
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
