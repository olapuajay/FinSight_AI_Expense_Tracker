import express from "express";
import { addTransaction, getTrasactions, updateTransaction, deleteTransaction } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addTransaction);
router.get("/", protect, getTrasactions);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;