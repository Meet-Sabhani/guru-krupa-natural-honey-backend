import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 4001; // ✅ Fixed variable name

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    await connectDB(); // ✅ Ensure DB connection before starting server
    console.log("🚀 MongoDB connected successfully!");

    // Middleware
    app.use(express.json());
    app.use(cookieParser());
    app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000", // ✅ Specify allowed frontend origin
        credentials: true,
      })
    );

    // API Endpoints
    app.get("/", (req, res) => res.send("🔥 Server started successfully!"));
    app.use("/api/auth", authRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ~ Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    process.exit(1); // Exit on failure
  }
};

startServer();
