import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);

// static files in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

export { app };