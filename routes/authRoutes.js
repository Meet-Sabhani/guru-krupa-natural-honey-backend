import express from "express";
import {
  adminLogin,
  login,
  logout,
  register,
  sendVerifyOTP,
  verifyEmail,
} from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/user/email-verification", sendVerifyOTP);
authRoutes.post("/user/email-otp-verify", verifyEmail);

authRoutes.post("/admin-login", adminLogin);

export default authRoutes;
