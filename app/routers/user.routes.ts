import express from "express";
import { verifyUser } from "../middleware/VerifyUser";
import { userController } from "../controllers/user.controller";

const router = express.Router();

// Fetch logged-in user's profile
router.get("/getprofile", verifyUser(["user", "admin"]), (req, res) =>
  userController.getUserProfile(req, res)
);

export const userRouter = router;
