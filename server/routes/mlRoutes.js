import express from "express";
import { getRecommendation, getMLAnalytics } from "../controllers/mlController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get doctor recommendation based on symptom description
router.post("/recommend", protect, getRecommendation);

// Route to get aggregated ML analytics for Admin dashboard
router.get("/analytics", protect, getMLAnalytics);

export default router;
