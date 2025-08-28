import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    limit: { type: Number, required: true },
    spent: { type: Number, default: 0 },
  }, { timestamps: true }
);

const budgetModel = mongoose.model("Budget", budgetSchema);

export default budgetModel;