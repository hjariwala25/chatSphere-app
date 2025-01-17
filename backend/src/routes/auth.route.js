import { Router } from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth route working");
});

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
