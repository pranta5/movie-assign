import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserInterface } from "../types/user.types";
import { UserModel } from "../models/user.model";
import { sendEmail } from "../helper/SendMail";

const JWT_SECRET = process.env.JWT_SECRET || "ksdnfasfksvndvs";

class AuthRepositoryV2 {
  /**
   * Register new user
   */
  async registerUser(payload: UserInterface) {
    const { name, email, phone, address, password } = payload;

    // Check if user already exists
    const exists = await UserModel.findOne({ email });
    if (exists) {
      return {
        success: false,
        statusCode: 409,
        message: "User already exists",
      };
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user record
    const userDoc = new UserModel({
      name,
      email,
      phone,
      address,
      password: hashed,
    });

    await userDoc.save();

    // Send email verification link
    await sendEmail(userDoc._id.toString(), userDoc.email, userDoc.name);

    return {
      success: true,
      statusCode: 201,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
      },
    };
  }

  /**
   * Login existing user
   */
  async loginUser(email: string, password: string) {
    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    if (!user.isVerified) {
      return {
        success: false,
        statusCode: 403,
        message: "Please verify your email before logging in",
      };
    }

    // Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        success: false,
        statusCode: 401,
        message: "Invalid email or password",
      };
    }

    // Issue JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      success: true,
      statusCode: 200,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authRepositories = new AuthRepositoryV2();
