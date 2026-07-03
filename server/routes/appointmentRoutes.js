import express from "express";
import {
  createAppointment,
  getAppointments,
  cancelAppointment,
  completeAppointment,
  checkInAppointment,
  getBookedSlots,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/booked-slots", protect, getBookedSlots);
router.post("/", protect, createAppointment);
router.get("/", protect, getAppointments);
router.patch("/:id/cancel", protect, cancelAppointment);
router.patch("/:id/complete", protect, completeAppointment);
router.patch("/:id/checkin", protect, checkInAppointment);

export default router;
