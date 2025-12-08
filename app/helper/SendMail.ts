import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/emailConfig";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "ksdnfasfksvndvs";
const BASE_URL = process.env.BACKEND_HOST || "http://localhost:8000";

export const sendEmail = async (
  userId: string,
  email: string,
  name: string
) => {
  try {
    // generate verification token
    const token = jwt.sign({ id: userId, email }, SECRET_KEY, {
      expiresIn: "1d",
    });

    const verifyUrl = `${BASE_URL}/api/v1/auth/verifyemail/${token}`;

    const htmlBody = `
      <div style="font-family:Arial, sans-serif; line-height:1.6">
        <h2>Hello ${name},</h2>
        <p>Welcome! Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" 
           style="background:#4CAF50;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">
           Verify Email
        </a>
        <p>This link will remain valid for the next 24 hours.</p>
        <br/>
        <p>If you did not sign up for this account, feel free to ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification Required",
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Verification email dispatched to ${email}`);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }
};
