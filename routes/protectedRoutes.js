import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { protectedRouteHandler } from "../controller/protectedRouteHandler.js";
import { getUserDetails, getUsers } from "../controller/authController.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

const protectedRoutes = express.Router();

// Admin protected routes
protectedRoutes.get("/dashboard", authenticate, protectedRouteHandler);
protectedRoutes.post("/admin/user-list", authenticate, getUsers);

// Product management routes (protected for admins)
protectedRoutes.post("/admin/product-create", authenticate, createProduct);
protectedRoutes.post("/admin/product-list", authenticate, getAllProducts);
protectedRoutes.put("/admin/product-update/:id", authenticate, updateProduct);
protectedRoutes.delete(
  "/admin/product-delete/:id",
  authenticate,
  deleteProduct
);

// product details api
protectedRoutes.get("/product-details/:id", authenticate, getProductById);

protectedRoutes.get("/user-details/:userId", authenticate, getUserDetails);

export default protectedRoutes;
