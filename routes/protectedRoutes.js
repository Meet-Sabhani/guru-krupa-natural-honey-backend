import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { protectedRouteHandler } from "../controller/protectedRouteHandler.js";
// import { protectedRouteHandler } from "../controller/protectedController.js";

const protectedRoutes = express.Router();

protectedRoutes.get("/dashboard", authenticate, protectedRouteHandler); // Fixed route

export default protectedRoutes;
