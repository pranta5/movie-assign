import { Request, Response } from "express";
import { StatusCode } from "../helper/StatusCode";
import { userRepositories } from "../repositories/user.repositories";

class UserControllerV2 {
  // Fetch current user's profile
  async getUserProfile(req: Request, res: Response): Promise<any> {
    try {
      const uid = (req as any).user?.id; // JWT middleware injects user

      if (!uid) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const profile = await userRepositories.getProfile(uid);

      if (!profile) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "User profile fetched successfully",
        data: profile,
      });
    } catch (err) {
      console.error("getUserProfile error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while fetching profile",
      });
    }
  }
}

export const userController = new UserControllerV2();
