import express from "express";
import { setBudget, getBudget, updateBudget, checkBudgetAlert } from "../controllers/budgetController.js";

const router = express.Router();

router.post("/set", setBudget);
router.get("/:userId/:month/:year", getBudget);
router.put("/update/:id", updateBudget);
router.get("/alert/:userId/:month/:year", checkBudgetAlert);

export default router;