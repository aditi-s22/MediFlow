import express from "express";
import { getQueue, callNext } from "../controllers/queueController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:doctorId", protect, getQueue);
router.post("/:doctorId/next", protect, callNext);

export default router;
