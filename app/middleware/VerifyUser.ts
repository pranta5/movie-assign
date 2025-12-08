import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../helper/StatusCode";
import { DecodedUserInterface } from "../types/decodedUser.types";

export function verifyUser(role: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined =
        req.cookies?.token ||
        req.body?.token ||
        req.query?.token ||
        (req.headers["authorization"] as string) ||
        (req.headers["x-access-token"] as string);

      if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "No token provided",
        });
      }

      // Handle Bearer prefix
      if (token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "ksdnfasfksvndvs"
      ) as DecodedUserInterface;

      // Role check (supports single or multiple roles)
      const allowedRoles = Array.isArray(role) ? role : [role];
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: `Access denied. Only for ${allowedRoles.join(", ")}.`,
        });
      }

      // Attach decoded user to request
      (req as any).user = decoded;

      next();
    } catch (err: any) {
      console.error("Token verification error:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Token has expired, please log in again",
        });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Invalid token",
        });
      }
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}
