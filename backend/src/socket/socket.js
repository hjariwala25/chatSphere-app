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
      
      // Remove old socket if exists
      const existingSocketId = userSocketMap[userId];
      if (existingSocketId && existingSocketId !== socket.id) {
        io.sockets.sockets.get(existingSocketId)?.disconnect();
      }

      userSocketMap[userId] = socket.id;
      socket.userId = userId;

      // Broadcast to all clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      socket.broadcast.emit("userConnected", userId);
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        delete userSocketMap[socket.userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        socket.broadcast.emit("userDisconnected", socket.userId);
      }
    });
  });

  return io;
};

export { configureSocket, getReceiverSocketId, io };