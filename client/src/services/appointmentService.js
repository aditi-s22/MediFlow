import api from "./api";

const getAppointments = () => api.get("/appointments");

const createAppointment = (data) => api.post("/appointments", data);

const cancelAppointment = (id) => api.patch(`/appointments/${id}/cancel`);

const completeAppointment = (id) => api.patch(`/appointments/${id}/complete`);

const checkInAppointment = (id) => api.patch(`/appointments/${id}/checkin`);

export { getAppointments, createAppointment, cancelAppointment, completeAppointment, checkInAppointment };
