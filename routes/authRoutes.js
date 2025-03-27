import express from "express";
import {
  adminLogin,
  login,
  logout,
  register,
} from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/admin-login", adminLogin);

export default authRoutes;
