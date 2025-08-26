import transactionModel from "../models/Transaction.js";

export const addTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.create({ ...req.body, user: req.user.id });
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
    const transaction = await transactionModel.findByIdAndUpdate(
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
    const transaction = await transactionModel.findByIdAndDelete(
      { _id: req.params.id, user: req.user.id, }
    );
    if(!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
