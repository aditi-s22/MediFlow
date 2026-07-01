import api from "./api";

const getDashboardStats = () => api.get("/admin/dashboard");

const getAllAppointments = () => api.get("/admin/appointments");

export { getDashboardStats, getAllAppointments };
