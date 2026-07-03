import api from "./api";

const getAppointments = () => api.get("/appointments");

const createAppointment = (data) => api.post("/appointments", data);

const cancelAppointment = (id) => api.patch(`/appointments/${id}/cancel`);

const completeAppointment = (id) => api.patch(`/appointments/${id}/complete`);

const checkInAppointment = (id) => api.patch(`/appointments/${id}/checkin`);

const getBookedSlots = (doctor, date) => api.get("/appointments/booked-slots", { params: { doctor, date } });

export { getAppointments, createAppointment, cancelAppointment, completeAppointment, checkInAppointment, getBookedSlots };
