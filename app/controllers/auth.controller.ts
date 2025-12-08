import { Request, Response } from "express";
import { UserModel, UserSchemaValidate } from "../models/user.model";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { StatusCode } from "../helper/StatusCode";
import { authRepositories } from "../repositories/auth.repositories";

const SECRET_KEY = process.env.JWT_SECRET || "ksdnfasfksvndvs";

type TokenPayload = {
  id: string;
  email: string;
};

class AuthControllerVariant {
  // Register a user
  async register(req: Request, res: Response): Promise<any> {
    try {
      const validation = UserSchemaValidate.validate(req.body);
      if (validation.error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: validation.error.details[0].message,
        });
      }

      const result = await authRepositories.registerUser(validation.value);

      if (result.success) {
        return res.status(result.statusCode).json({
          success: true,
          message: result.message,
          user: result.user,
        });
      }

      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    } catch (err) {
      console.error("Registration failed:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }

  // Login a user
  async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await authRepositories.loginUser(email, password);

      if (result.success) {
        return res.status(result.statusCode).json({
          success: true,
          message: result.message,
          token: result.token,
          user: result.user,
        });
      }

      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    } catch (err) {
      console.error("Login failed:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Verify email using token
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;

      // validate token presence
      if (!token) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Verification token is required",
        });
      }

      const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification link",
        });
      }

      if (user.isVerified) {
        return res.status(200).json({
          success: true,
          message: "Email already verified",
        });
      }

      user.isVerified = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Email verified successfully!",
      });
    } catch (err) {
      console.error("Email verification error:", err);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }
}

export const authController = new AuthControllerVariant();
