import api from "./api";

const getQueue = (doctorId) => api.get(`/queue/${doctorId}`);

const callNext = (doctorId) => api.post(`/queue/${doctorId}/next`);

export { getQueue, callNext };
