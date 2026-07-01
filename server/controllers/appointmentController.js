import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import PredictionLog from "../models/PredictionLog.js";
import isSameUser from "../utils/isSameUser.js";
import getPopulatedAppointments from "../utils/getPopulatedAppointments.js";
import buildQueuePayload from "../utils/buildQueuePayload.js";

// Emits queueUpdated with the full current queue snapshot to everyone in the doctor's room.
// Called after any action that changes the queue (checkin, complete, cancel).
const emitQueueUpdated = async (io, doctorId) => {
  if (!io) return;
  const payload = await buildQueuePayload(doctorId.toString());
  io.to(`doctor_${doctorId}`).emit("queueUpdated", payload);
};

// @route   POST /api/appointments
// @desc    Patient books a new appointment with a doctor
const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctor || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "Doctor, date, and time are required" });
    }

    const doctorUser = await User.findOne({ _id: doctor, role: "doctor" });
    if (!doctorUser) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Rule 1: appointment date cannot be in the past (date-only comparison, time of day ignored)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(appointmentDate);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ message: "Appointment date cannot be in the past" });
    }

    // Rule 2: the requested time must be one of the doctor's declared available slots
    if (!doctorUser.availableSlots.includes(appointmentTime)) {
      return res.status(400).json({ message: "Selected time slot is unavailable" });
    }

    // Rule 3: prevent double-booking the same doctor/date/time, unless the old booking was cancelled
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: requestedDate,
      appointmentTime,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Appointment slot already booked" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: requestedDate,
      appointmentTime,
      reason,
      status: "confirmed",
      queueNumber: null,
      estimatedWait: null,
    });

    if (req.body.predictionLogId) {
      try {
        await PredictionLog.findByIdAndUpdate(req.body.predictionLogId, { chosenDoctor: doctor });
      } catch (err) {
        console.error("Failed to update chosen doctor in PredictionLog:", err.message);
      }
    }

    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/appointments
// @desc    Role-aware appointment list — patient sees own, doctor sees own, admin sees all
const getAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter = { patient: req.user._id };
    } else if (req.user.role === "doctor") {
      filter = { doctor: req.user._id };
    }
    // admin: no filter — sees all appointments

    const appointments = await getPopulatedAppointments(filter);

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/appointments/:id/cancel
// @desc    Cancel an appointment — patient/doctor can cancel their own, admin can cancel any
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isOwner =
      (req.user.role === "patient" && isSameUser(appointment.patient, req.user._id)) ||
      (req.user.role === "doctor" && isSameUser(appointment.doctor, req.user._id));

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    await emitQueueUpdated(req.app.get("io"), appointment.doctor);

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/appointments/:id/complete
// @desc    Doctor marks an appointment they're assigned to as completed
const completeAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can complete appointments" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!isSameUser(appointment.doctor, req.user._id)) {
      return res.status(403).json({ message: "Not authorized to complete this appointment" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Cannot complete a cancelled appointment" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Appointment is already completed" });
    }

    appointment.status = "completed";
    await appointment.save();

    await emitQueueUpdated(req.app.get("io"), appointment.doctor);

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/appointments/:id/checkin
// @desc    Patient checks in for their appointment — assigns a queue number
const checkInAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can check in" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!isSameUser(appointment.patient, req.user._id)) {
      return res.status(403).json({ message: "Not authorized to check in for this appointment" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({ message: "Only confirmed appointments can be checked in" });
    }

    if (appointment.queueNumber !== null) {
      return res.status(400).json({ message: "Already checked in" });
    }

    // Check-in is only allowed on the appointment date itself
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(appointment.appointmentDate);
    apptDate.setHours(0, 0, 0, 0);
    if (apptDate.getTime() !== today.getTime()) {
      return res.status(400).json({ message: "You can only check in on your appointment date" });
    }

    // Count how many appointments for this doctor on this date already have a queue number
    const checkedInCount = await Appointment.countDocuments({
      doctor: appointment.doctor,
      appointmentDate: appointment.appointmentDate,
      queueNumber: { $ne: null },
    });

    appointment.queueNumber = checkedInCount + 1;
    await appointment.save();

    await emitQueueUpdated(req.app.get("io"), appointment.doctor);

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createAppointment, getAppointments, cancelAppointment, completeAppointment, checkInAppointment };
