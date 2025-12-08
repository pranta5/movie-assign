import { Types } from "mongoose";

export interface UserInterface {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
