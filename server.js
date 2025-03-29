import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js"; // Secure routes

const app = express();
const PORT = process.env.PORT || 4001;

const startServer = async () => {
  try {
    await connectDB();
    console.log("🚀 MongoDB connected successfully!");

    // Middleware
    app.use(express.json()); // ✅ Ensure JSON parsing

    // cors
    app.use(
      cors({
        origin: [
          "https://guru-krupa-natural-honey.vercel.app",
          "http://localhost:3000",
        ],
        credentials: true, // ✅ Important for cookies/sessions
      })
    );

    // methods: ["GET", "POST", "PUT", "DELETE"],
    // allowedHeaders: ["Content-Type", "Authorization"],

    // API Endpoints
    app.get("/", (req, res) => res.send("🔥 Server started successfully!"));
    app.use("/api/auth", authRoutes);
    app.use("/api/protected", protectedRoutes); // Secure API routes

    // Handle invalid API routes
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Invalid API call. This route does not exist.",
      });
    });

    // Global Error Handling Middleware
    app.use((err, req, res, next) => {
      console.error("❌ Global Error:", err.message);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();
