import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import io from "socket.io-client";

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      setTimeout(() => {
        get().connectSocket();
      }, 100);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },


  

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    // Clean up existing socket
    const existingSocket = get().socket;
    if (existingSocket) {
      existingSocket.disconnect();
      set({ socket: null });
    }

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    let isConnected = false;

    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);
      if (!isConnected) {
        socket.emit("setup", authUser._id);
        isConnected = true;
      }
    });

    socket.on("getOnlineUsers", (users) => {
      const filteredUsers = users.filter(id => id !== authUser._id);
      set({ onlineUsers: filteredUsers });
    });

    socket.on("userConnected", (userId) => {
      if (userId !== authUser._id) {
        set(state => ({
          onlineUsers: Array.from(new Set([...state.onlineUsers, userId]))
        }));
      }
    });

    socket.on("userDisconnected", (userId) => {
      set(state => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId)
      }));
    });

    set({ socket });
  },

  getOnlineUsers: () => {
    const socket = get().socket;
    if (socket) {
      socket.emit("getOnlineUsers");
    }
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.off("getOnlineUsers");
      socket.off("userConnected");
      socket.off("userDisconnected");
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  }
}));
