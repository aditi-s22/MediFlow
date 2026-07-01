import api from "./api";

const getRecommendation = (symptoms) => api.post("/ml/recommend", { symptoms });
const getMLAnalytics = () => api.get("/ml/analytics");

export { getRecommendation, getMLAnalytics };
