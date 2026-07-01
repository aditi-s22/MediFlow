import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { getQueueEntry, setCurrentServing } from "../utils/queueStore.js";
import buildQueuePayload from "../utils/buildQueuePayload.js";

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// @route   GET /api/queue/:doctorId
// @desc    Return today's checked-in queue for one doctor, with live wait estimates
const getQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" }).select("name specialization");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const payload = await buildQueuePayload(doctorId);

    res.json({
      doctor: { _id: doctor._id, name: doctor.name, specialization: doctor.specialization },
      ...payload,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/queue/:doctorId/next
// @desc    Doctor marks the next patient as currently being served — memory only, no DB write
const callNext = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can call the next patient" });
    }

    const { doctorId } = req.params;

    if (req.user._id.toString() !== doctorId) {
      return res.status(403).json({ message: "You can only manage your own queue" });
    }

    const { start, end } = todayRange();

    const queue = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lt: end },
      status: "confirmed",
      queueNumber: { $ne: null },
    }).sort({ queueNumber: 1 });

    if (queue.length === 0) {
      return res.status(400).json({ message: "No patients in queue" });
    }

    const { currentServing } = getQueueEntry(doctorId);
    const currentIndex = currentServing
      ? queue.findIndex((a) => a._id.toString() === currentServing)
      : -1;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      return res.status(400).json({ message: "No more patients in queue" });
    }

    const nextAppointment = queue[nextIndex];
    setCurrentServing(doctorId, nextAppointment._id.toString());

    const io = req.app.get("io");
    if (io) {
      const payload = await buildQueuePayload(doctorId);
      io.to(`doctor_${doctorId}`).emit("queueUpdated", payload);
    }

    res.json({ currentServing: nextAppointment._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getQueue, callNext };
