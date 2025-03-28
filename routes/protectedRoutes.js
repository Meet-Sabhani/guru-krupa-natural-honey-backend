import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { protectedRouteHandler } from "../controller/protectedRouteHandler.js";
import { getUsers } from "../controller/authController.js";
// import { protectedRouteHandler } from "../controller/protectedController.js";

const protectedRoutes = express.Router();

protectedRoutes.get("/dashboard", authenticate, protectedRouteHandler); // Fixed route
protectedRoutes.post("/admin/user-list", getUsers, protectedRouteHandler); // Fixed route

export default protectedRoutes;
