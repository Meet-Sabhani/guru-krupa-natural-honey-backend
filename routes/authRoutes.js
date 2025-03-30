import express from "express";
import {
  adminLogin,
  changePassword,
  forgotPassword,
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
authRoutes.post("/user/forgot-password", forgotPassword);
authRoutes.post("/user/password-change", changePassword);

authRoutes.post("/admin-login", adminLogin);

export default authRoutes;
