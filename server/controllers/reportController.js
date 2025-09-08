import transactionModel from "../models/Transaction.js";
import budgetModel from "../models/Budget.js";
import { askGemini } from "../services/gemini.js";

export const getMonthlySummary = async (req, res) => {
  try {
    const { userId, month, year } = req.params;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await transactionModel.find({
      user: userId,
      date: { $gte: start, $lt: end },
    });

    const lastStart = new Date(year, month - 2, 1);
    const lastEnd = new Date(year, month - 1, 1);

    const lastTransactions = await transactionModel.find({
      user: userId,
      date: { $gte: lastStart, $lt: lastEnd },
    });

    // Total
    const totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const lastExpense = lastTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const lastIncome = lastTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    
    // Budgets
    const budgets = await budgetModel.find({ userId, year, month });

    let budgetSummary = { underBudget: 0, nearLimit: 0, overLimit: 0 };
    let categoryBreakdown = {};

    budgets.forEach(budget => {
      const spentInCategory = transactions
        .filter(t => t.type === "expense" && t.category === budget.category)
        .reduce((acc, t) => acc + t.amount, 0);
      
      const percentUsed = (spentInCategory / budget.limit) * 100;
      categoryBreakdown[budget.category] = {
        spent: spentInCategory,
        limit: budget.limit,
        percent: Math.min(percentUsed, 100),
      };
      if(percentUsed >= 100) budgetSummary.overLimit++;
      else if(percentUsed >= 80) budgetSummary.nearLimit++;
      else budgetSummary.underBudget++;
    });

    // Calculations
    const spendingChange = lastExpense > 0 ? (((totalExpense - lastExpense) / lastExpense) * 100).toFixed(2) : "N/A";

    const savings = totalIncome - totalExpense;
    const lastSavings = lastIncome - lastExpense;
    const savingsChange = lastSavings > 0 ? (((savings - lastSavings) / lastSavings) * 100).toFixed(2) : "N/A";

    const avgDailySpend = (totalExpense / new Date(year, month, 0).getDate()).toFixed(2);
    const lastAvgDaily = (lastExpense / new Date(year, month - 1, 0).getDate()).toFixed(2);
    const avgDailyChange = lastAvgDaily > 0 ? (((avgDailySpend - lastAvgDaily) / lastAvgDaily) * 100).toFixed(2) : "N/A";

    // Biggest spending category
    let biggestCategory = null;
    let maxAmount = 0;
    transactions.forEach(t => {
      if(t.type === "expense") {
        categoryBreakdown[t.category] = categoryBreakdown[t.category] || { spent: 0, limit: 0, percent: 0 };
        categoryBreakdown[t.category].spent += t.amount;

        if(categoryBreakdown[t.category].spent > maxAmount) {
          maxAmount = categoryBreakdown[t.category].spent;
          biggestCategory = t.category;
        }
      }
    });

    // Gemini Insights
    const aiPrompt = `
      You are a financial assistant. Based on this data:
      Income: ${totalIncome}, Expense: ${totalExpense}, Savings: ${savings}
      Category Breakdown: ${JSON.stringify(categoryBreakdown)}

      Provide atleast 3 clear, actionable financial insights in plain text.
    `;

    const aiAdvice = await askGemini(aiPrompt);

    // Response
    res.status(200).json({
      dashboard: {
        monthlySpending: { total: totalExpense, change: spendingChange },
        budgetRemaining: {
          total: budgets.reduce((acc, b) => acc + b.limit, 0) - totalExpense,
          percentRemaining: (
            ((budgets.reduce((acc, b) => acc + b.limit, 0) - totalExpense) / budgets.reduce((acc, b) => acc + b.limit, 0)) * 100
          ).toFixed(2),
        },
        savingsRate: { amount: savings, change: savingsChange },
        budgetSummary,
        categoryBreakdown,
      },
      reports: {
        biggestSpendingCategory: { category: biggestCategory, amount: maxAmount },
        totalSavingsVsLastMonth: { current: savings, last: lastSavings, change: savingsChange },
        avgDailySpend: { current: avgDailySpend, change: avgDailyChange },
      },
      charts: {
        spedingTrend: [],
        categoryBreakdown,
        incomeVsExpense: { income: totalIncome, expense: totalExpense },
      },
      aiAdvice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};