import "dotenv/config";
import http from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { configureSocket } from "./socket/socket.js";

const server = http.createServer(app);
const io = configureSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 5001, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
    server.on("error", (err) => {
      console.log("Express server error", err);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

export { app, server, io };
