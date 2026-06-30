import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

dotenv.config(); // load variables from .env into process.env

connectDB(); // connect to MongoDB Atlas

const app = express();

app.use(cors()); // allow the React frontend (different port) to call this API
app.use(express.json()); // parse incoming JSON request bodies

// Health check route — confirms the server is alive.
// Useful for quickly testing the API with a browser or Postman
// before any real routes exist.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MediFlow API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
