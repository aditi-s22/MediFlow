import Appointment from "../models/Appointment.js";
import { getQueueEntry } from "./queueStore.js";

const MINUTES_PER_PATIENT = 15;

// Builds the full queue snapshot for one doctor on today's date.
// Used by both GET /api/queue/:doctorId and every queueUpdated socket emit
// so the frontend never needs a follow-up HTTP request after receiving the event.
const buildQueuePayload = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const queue = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: today, $lt: tomorrow },
    status: "confirmed",
    queueNumber: { $ne: null },
  })
    .populate("patient", "name phone")
    .sort({ queueNumber: 1 });

  const { currentServing } = getQueueEntry(doctorId.toString());

  const servingIndex = currentServing
    ? queue.findIndex((a) => a._id.toString() === currentServing)
    : -1;

  const queueData = queue.map((appt, index) => {
    const peopleAhead = servingIndex >= 0 ? index - servingIndex : index;
    return {
      _id: appt._id,
      queueNumber: appt.queueNumber,
      patientName: appt.patient.name,
      patientPhone: appt.patient.phone,
      appointmentTime: appt.appointmentTime,
      peopleAhead,
      estimatedWait: peopleAhead * MINUTES_PER_PATIENT,
    };
  });

  return { currentServing, queue: queueData };
};

export default buildQueuePayload;
