import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import initSocket from "./socket/socket.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "\n[FATAL] JWT_SECRET is missing or too short (< 32 chars).\n" +
    "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
    "Then set it in your .env file before starting the server.\n"
  );
  process.exit(1);
}

connectDB();

const app = express();
const httpServer = createServer(app); // Socket.io requires a raw HTTP server
const io = initSocket(httpServer);

app.set("io", io); // make io available inside controllers via req.app.get("io")

// In production, set CLIENT_ORIGIN to your frontend domain to restrict CORS.
// Falls back to allowing all origins in development.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MediFlow API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/queue", queueRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
