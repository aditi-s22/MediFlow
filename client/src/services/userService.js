import api from "./api";

const getProfile = () => api.get("/users/profile");

const updateProfile = (data) => api.put("/users/profile", data);

export { getProfile, updateProfile };
