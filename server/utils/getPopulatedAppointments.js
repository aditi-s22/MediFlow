import Appointment from "../models/Appointment.js";

// Shared query used everywhere we list appointments — keeps the populated
// fields and sort order consistent between the role-aware and admin endpoints.
const getPopulatedAppointments = (filter = {}) =>
  Appointment.find(filter)
    .populate("patient", "name email phone")
    .populate("doctor", "name specialization")
    .sort({ appointmentDate: 1 });

export default getPopulatedAppointments;
