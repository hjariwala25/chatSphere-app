import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route working");
});

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(logout);

export default router;
