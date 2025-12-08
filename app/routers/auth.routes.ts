import express from "express";
import { authController } from "../controllers/auth.controller";

const router = express.Router();

// Register user
router.post("/register", (req, res) => authController.register(req, res));

// Login user
router.post("/login", (req, res) => authController.login(req, res));

// Verify email token
router.get("/verifyemail/:token", (req, res) =>
  authController.verifyEmail(req, res)
);

export const authRouter = router;
