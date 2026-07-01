import express from "express";
import { getDashboardStats, getAllAppointments } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);
router.get("/appointments", protect, authorizeRoles("admin"), getAllAppointments);

export default router;
