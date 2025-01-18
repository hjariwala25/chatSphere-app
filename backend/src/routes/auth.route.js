import { Router } from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route working");
});

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/update-profile").put(protectRoute, updateProfile);

router.route("/check").get(protectRoute, checkAuth);

export default router;
