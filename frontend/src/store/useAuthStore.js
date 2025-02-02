import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import io from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ?"http://localhost:5001": "/";

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
      console.log("Error in checkAuth", error.message);
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
      const userData = res.data;
      
      // Connect socket before updating auth state
      const socket = io(BASE_URL, {
        query: { userId: userData._id },
        transports: ["websocket"],
        reconnection: true,
      });

      await new Promise((resolve) => {
        socket.on("connect", () => {
          set({ socket });
          resolve();
        });
      });

      set({ 
        authUser: userData,
        isLoggingIn: false // Reset loading state after socket connection
      });

      toast.success("Logged in successfully");
    } catch (error) {
      set({ isLoggingIn: false }); // Reset loading state on error
      toast.error(error?.response?.data?.message || "Login failed");
    }
  },

  logout: async () => {
    try {
      // Disconnect socket before logout
      get().disconnectSocket();
      
      await axiosInstance.post("/auth/logout");
      
      // Reset all states
      set({ 
        authUser: null,
        isLoggingIn: false,
        socket: null,
        onlineUsers: []
      });
      
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
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

  connectSocket: async () => {
    const { authUser } = get();
    if (!authUser) return;
  
    get().disconnectSocket();
  
    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    return new Promise((resolve) => {
      socket.on("connect", () => {
        // console.log("Socket connected!", socket.id);
        socket.emit("setup", authUser._id);
        socket.emit("getOnlineUsers");
        resolve();
      });
  
      socket.on("getOnlineUsers", (users) => {
        const filteredUsers = users.filter(id => id !== authUser._id);
        set({ onlineUsers: filteredUsers });
      });
  
      set({ socket });
    });
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
  },
}));
