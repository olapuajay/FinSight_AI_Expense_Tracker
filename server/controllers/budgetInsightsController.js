import transactionModel from "../models/Transaction.js";
import budgetModel from "../models/Budget.js";
import { budgetInsights } from "../services/gemini.js";

export const getBudgetInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const transaction = await transactionModel.find({
      userId: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const budget = await budgetModel.findOne({ userId: userId });

    if(!budget) {
      return res.status(400).json({ message: "No budget set for this user" });
    }

    const insights = await budgetInsights(transaction, budget);

    res.status(200).json({ success: true, insights });
  } catch (error) {
    console.log("Error fetching budget insights: ", error);
    res.status(500).json({ message: "Error fetching budget insights" });
  }
};