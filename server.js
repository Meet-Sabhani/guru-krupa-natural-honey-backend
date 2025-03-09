import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = process.env.port || 4001;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

// API End Points
app.get("/", (req, res) => res.send("server start on "));
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log("🚀 ~ server running on port:", port);
});
