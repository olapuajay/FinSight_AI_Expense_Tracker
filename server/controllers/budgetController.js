import budgetModel from "../models/Budget.js";

export const setBudget = async (req, res) => {
  try {
    const { userId, month, year, limit, categoryBudgets = [] } = req.body;

    const existingBudget = await budgetModel.findOne({ 
      userId, 
      month: Number(month),
      year: Number(year) 
    });

    if(existingBudget) {
      return res.status(400).json({ message: "Budget already exists for this month" });
    }

    const budget = await budgetModel.create({ userId, month: Number(month), year: Number(year), limit, categoryBudgets });
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

    const overallPercentage = (budget.spent / budget.limit) * 100;
    let overallAlert = "Within budget";

    if(overallPercentage >= 100) overallAlert = "Budget exceeded!";
    else if(overallPercentage >= 80) overallAlert = "Warning: 80% budget used";

    const categoryAlerts = budget.categoryBudgets.map(cat => {
      const percentage = (cat.spent / cat.categoryLimit) * 100;
      let alert = "Within budget";

      if(percentage >= 100) alert = "Budget exceeded!";
      else if(percentage >= 80) alert = "Warning: 80% budget used";

      return {
        category: cat.category,
        categorySpent: cat.spent,
        categoryLimit: cat.categoryAlerts,
        percentage: Number(percentage.toFixed(2)) + "%",
        alert,
      };
    });

    res.status(200).json({
      month: budget.month,
      year: budget.year,
      limit: budget.limit,
      spent: budget.spent,
      percent: Number(overallPercentage).toFixed(2) + "%",
      overallAlert,
      categoryAlerts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { limit, categoryBudgets } = req.body;
    const { id } = req.params;

    const updateFields = {};
    if(limit) updateFields.limit = limit;
    if(categoryBudgets) updateFields.categoryBudgets = categoryBudgets;

    const budget = await budgetModel.findByIdAndUpdate(id, updateFields, { new: true });
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    res.status(200).json({ message: "Budget updated successfully", budget });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await budgetModel.findByIdAndDelete(id);
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkBudgetAlert = async (req, res) => {
  try {
    const { userId, month, year } = req.params;

    const budget = await budgetModel.findOne({ userId, month: Number(month), year: Number(year) });
    if(!budget) {
      return res.status(404).json({ message: "No budget found" });
    }

    const overallPercentage = (budget.spent / budget.limit) * 100;
    let overallAlert = "Within budget";

    if(overallPercentage >= 100) overallAlert = "Budget exceeded!";
    else if(overallPercentage >= 80) overallAlert = "Warning: 80% budget used";

    const categoryAlerts = budget.categoryBudgets.map(cat => {
      const percentage = (cat.spent / cat.categoryLimit) * 100;
      let alert = "Within budget";

      if(percentage >= 100) alert = "Budget exceeded!";
      else if(percentage >= 80) alert = "Warning: 80% budget used";

      return {
        category: cat.category,
        categorySpent: cat.spent,
        categoryLimit: cat.categoryAlerts,
        percentage: Number(percentage.toFixed(2)) + "%",
        alert,
      };
    });

    res.status(200).json({ 
      budgetId: budget._id,
      month: budget.month,
      year: budget.year,
      overall: {
        spent: budget.spent,
        limit: budget.limit,
        percentage: Number(overallPercentage.toFixed(2)) + "%",
        alert: overallAlert,
      },
      categories: categoryAlerts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};