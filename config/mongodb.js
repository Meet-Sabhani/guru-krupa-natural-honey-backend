import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("⚡ MongoDB is already connected.");
      return;
    }

    await mongoose.connect("mongodb://localhost:27017/guruKrupa", {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if MongoDB is unreachable
      connectTimeoutMS: 10000, // Connection timeout
    });

    console.log("🚀 MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
