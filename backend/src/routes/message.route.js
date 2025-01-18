import { Router } from "express";
import { getUsersForSidebar, getMessages, sendMessages } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/users").get(protectRoute, getUsersForSidebar);

router.route("/:id").get(protectRoute, getMessages);

router.route("/send/:id").post(protectRoute, sendMessages);

export default router;
