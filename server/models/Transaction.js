import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    payment: { type: String, enum: ["card", "cash", "upi"] },
    note: { type: String },
  }, { timestamps: true }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);

export default transactionModel;