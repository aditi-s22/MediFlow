import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import getPopulatedAppointments from "../utils/getPopulatedAppointments.js";

// @route   GET /api/admin/dashboard
// @desc    Summary counts for the admin dashboard — one request instead of several
const getDashboardStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, confirmed, completed, cancelled] =
      await Promise.all([
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "confirmed" }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "cancelled" }),
      ]);

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      confirmed,
      completed,
      cancelled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/admin/appointments
// @desc    List every appointment in the system, for admin oversight
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await getPopulatedAppointments();

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDashboardStats, getAllAppointments };
