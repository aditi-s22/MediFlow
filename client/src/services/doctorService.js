import api from "./api";

const getDoctors = (params) => api.get("/doctors", { params });

const getDoctorById = (id) => api.get(`/doctors/${id}`);

const createDoctor = (data) => api.post("/doctors", data);

const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);

const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

export { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
