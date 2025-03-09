import express from "express";
import { login, logout, register } from "../controller/authController.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

export default authRoutes;
