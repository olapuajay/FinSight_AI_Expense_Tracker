import express from "express";
import multer from "multer";
import { addTransaction, getTrasactions, updateTransaction, deleteTransaction, uploadReceipt } from "../controllers/transactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", protect, addTransaction);
router.get("/", protect, getTrasactions);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

router.post("/upload-receipt", upload.single("receipt"), protect, uploadReceipt);

export default router;