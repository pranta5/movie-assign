import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "ksdnfasfksvndvs";

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "1h" });
};
