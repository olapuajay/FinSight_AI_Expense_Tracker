import express from "express";
import { setBudget, getBudget, updateBudget, checkBudgetAlert, deleteBudget } from "../controllers/budgetController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/set", protect, setBudget);
router.get("/:userId/:month/:year", protect, getBudget);
router.put("/update/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);
router.get("/alert/:userId/:month/:year", protect, checkBudgetAlert);

export default router;