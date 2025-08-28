import transactionModel from "../models/Transaction.js";
import budgetModel from "../models/Budget.js";
import mongoose from "mongoose";

export const addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, date, payment, note } = req.body;

    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid date provided" });
    }

    const transaction = await transactionModel.create({ 
      user: userId,
      category,
      amount: Number(amount),
      date: parsedDate,
      payment,
      note, 
    });

    const month = Number(parsedDate.getMonth() + 1);
    const year = Number(parsedDate.getFullYear());

    const budget = await budgetModel.findOne({ userId: new mongoose.Types.ObjectId(userId), month, year });

    if(budget) {
      budget.spent += amount;
      await budget.save();
    }

    res.status(201).json({ message: "New transaction added", transaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTrasactions = async (req, res) => {
  try {
    const transactions = await transactionModel.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true },
    );
    if(!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction updated", transaction });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.findOne(
      { _id: req.params.id, user: req.user.id, }
    );
    if(!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transactionModel.deleteOne({ _id: req.params.id, user: req.user.id });

    const month = Number(transaction.date.getMonth() + 1);
    const year = Number(transaction.date.getFullYear());

    const budget = await budgetModel.findOne({ 
      userId: new mongoose.Types.ObjectId(req.user.id),
      month,
      year
    });

    if(budget) {
      budget.spent -= transaction.amount;
      if(budget.spent < 0) budget.spent = 0;
      await budget.save();
    }
    
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
