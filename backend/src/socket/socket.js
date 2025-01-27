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
    pingTimeout: 60000
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
  
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  
    socket.on("sendMessage", (message) => {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      const userId = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === socket.id
      );
      if (userId) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });
  });

  return io;
};

export { configureSocket, getReceiverSocketId, io };