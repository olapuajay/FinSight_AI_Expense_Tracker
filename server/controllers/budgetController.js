import budgetModel from "../models/Budget.js";
import mongoose from "mongoose";

export const setBudget = async (req, res) => {
  try {
    const { userId, month, year, limit } = req.body;

    const existingBudget = await budgetModel.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      month: Number(month), 
      year: Number(year) 
    });

    if(existingBudget) {
      return res.status(400).json({ message: "Budget already exists for this month" });
    }

    const budget = await budgetModel.create({ userId: new mongoose.Types.ObjectId(userId), month: Number(month), year: Number(year), limit });
    res.status(201).json({ message: "Budget set successfully", budget });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBudget = async (req, res) => {
  try {
    const { userId, month, year } = req.params;

    const budget = await budgetModel.findOne({ userId, month: Number(month), year: Number(year) });
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    res.status(200).json(budget);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { limit } = req.body;
    const { id } = req.params;

    const budget = await budgetModel.findByIdAndUpdate(id, { limit }, { new: true });
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    res.status(200).json({ message: "Budget updated successfully", budget });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkBudgetAlert = async (req, res) => {
  try {
    const { userId, month, year } = req.params;

    const budget = await budgetModel.findOne({ userId: new mongoose.Types.ObjectId(userId), month: Number(month), year: Number(year) });
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    const percentage = (budget.spent / budget.limit) * 100;
    let alert = "Within budget";

    if(percentage >= 100) alert = "Budget exceeded!";
    else if(percentage >= 80) alert = "Warning: 80% budget used";

    res.status(200).json({ ...budget._doc, alert });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};