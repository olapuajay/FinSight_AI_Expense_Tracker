import express from "express";
import { getMonthlySummary } from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/summary/:userId/:month/:year", protect, getMonthlySummary);

export default router;