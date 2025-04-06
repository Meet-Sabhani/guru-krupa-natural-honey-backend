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
  productStatusChange,
  getActiveProducts,
} from "../controller/productController.js";
import {
  checkout,
  getOrderHistory,
  verifyOrder,
} from "../controller/orderController.js";

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
protectedRoutes.post(
  "/admin/product-status-change/:id",
  authenticate,
  productStatusChange
);

// for home page & user products list & removed auth
protectedRoutes.post("/user/active-products", getActiveProducts);

// product details api
protectedRoutes.get("/product-details/:id", getProductById);

protectedRoutes.get("/user-details/:userId", authenticate, getUserDetails);

// oder payment routes
protectedRoutes.post("/checkout", authenticate, checkout);
protectedRoutes.post("/order-history", authenticate, getOrderHistory); // oder history for admin & user

// protectedRoutes.post("/create-payment-instance", authenticate, createOrder); // create Razorpay  Instance
protectedRoutes.post("/payment-verify", authenticate, verifyOrder); // verify

export default protectedRoutes;
