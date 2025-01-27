import { Server } from "socket.io";

const configureSocket = (server) => {
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

//to store online user
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if(userId) userSocketMap[userId] = socket.id;

    //send online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

return io;
};

export { configureSocket };
