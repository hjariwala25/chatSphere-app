import { Server } from "socket.io";

const userSocketMap = {};
let io; 

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const configureSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    },
  });
  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("setup", (userId) => {
      if (!userId) return;

      // Clean up old socket
      const existingSocketId = userSocketMap[userId];
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.disconnect();
        }
        delete userSocketMap[userId];
      }

      // Set up new socket
      socket.userId = userId;
      userSocketMap[userId] = socket.id;

      // Emit to all clients including sender
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });
  return io;
};

export { configureSocket, getReceiverSocketId, io };