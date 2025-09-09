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

    // --- Current totals from transactions ---
    let totalExpense = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    let totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    // --- Last month totals from transactions ---
    let lastExpense = lastTransactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    let lastIncome = lastTransactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    // --- Current month budget ---
    const budget = await budgetModel.findOne({ userId, year, month });

    let budgetSummary = { underBudget: 0, nearLimit: 0, overLimit: 0 };
    let categoryBreakdown = {};

    if (budget && budget.categoryBudgets.length > 0) {
      for (let cat of budget.categoryBudgets) {
        const spentFromTx = transactions
          .filter(t => t.type === "expense" && t.category === cat.category)
          .reduce((acc, t) => acc + t.amount, 0);

        const actualSpent = spentFromTx > 0 ? spentFromTx : (cat.spent || 0);

        if (spentFromTx === 0 && actualSpent > 0) {
          totalExpense += actualSpent;
        }

        const percentUsed = (actualSpent / cat.categoryLimit) * 100;

        categoryBreakdown[cat.category] = {
          spent: actualSpent,
          limit: cat.categoryLimit,
          percent: Math.min(percentUsed, 100),
        };

        if (percentUsed >= 100) budgetSummary.overLimit++;
        else if (percentUsed >= 80) budgetSummary.nearLimit++;
        else budgetSummary.underBudget++;
      }
    }

    // --- Last month budget fallback ---
    const lastBudget = await budgetModel.findOne({
      userId,
      year,
      month: month - 1,
    });

    if (lastBudget && lastBudget.categoryBudgets.length > 0) {
      for (let cat of lastBudget.categoryBudgets) {
        const spentFromTx = lastTransactions
          .filter(t => t.type === "expense" && t.category === cat.category)
          .reduce((acc, t) => acc + t.amount, 0);

        const actualSpent = spentFromTx > 0 ? spentFromTx : (cat.spent || 0);

        if (spentFromTx === 0 && actualSpent > 0) {
          lastExpense += actualSpent;
        }
      }
    }

    // --- Calculations ---
    const spendingChange =
      lastExpense > 0
        ? (((totalExpense - lastExpense) / lastExpense) * 100).toFixed(2)
        : "N/A";

    const savings = totalIncome - totalExpense;
    const lastSavings = lastIncome - lastExpense;
    const savingsChange =
      Math.abs(lastSavings) > 0
        ? (((savings - lastSavings) / Math.abs(lastSavings)) * 100).toFixed(2)
        : "N/A";

    const avgDailySpend = (
      totalExpense / new Date(year, month, 0).getDate()
    ).toFixed(2);
    const lastAvgDaily = (
      lastExpense / new Date(year, month - 1, 0).getDate()
    ).toFixed(2);
    const avgDailyChange =
      lastAvgDaily > 0
        ? (((avgDailySpend - lastAvgDaily) / lastAvgDaily) * 100).toFixed(2)
        : "N/A";

    // Biggest spending category
    let biggestCategory = null;
    let maxAmount = 0;
    for (let cat in categoryBreakdown) {
      if (categoryBreakdown[cat].spent > maxAmount) {
        maxAmount = categoryBreakdown[cat].spent;
        biggestCategory = cat;
      }
    }

    const dailyTrend = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    let runningExpense = 0;
    let runningIncome = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day);
      const dayEnd = new Date(year, month - 1, day + 1);

      const dayTransactions = transactions.filter(
        t => t.date >= dayStart && t.date < dayEnd
      );

      const dayExpense = dayTransactions
        .filter(t => t.type === "expense")
        .reduce((a, t) => a + t.amount, 0);

      const dayIncome = dayTransactions
        .filter(t => t.type === "income")
        .reduce((a, t) => a + t.amount, 0);

      runningExpense += dayExpense;
      runningIncome += dayIncome;

      dailyTrend.push({
        date: `${year}-${month}-${day}`,
        expense: dayExpense,
        income: dayIncome,
        cumulativeExpense: runningExpense,
        cumulativeIncome: runningIncome,
      });
    }


    const weeklyTrend = [];
    let weekIndex = 1;
    let runningWeeklyExpense = 0;
    let runningWeeklyIncome = 0;

    for (let i = 0; i < daysInMonth; i += 7) {
      const weekStart = new Date(year, month - 1, i + 1);
      const weekEnd = new Date(
        year,
        month - 1,
        Math.min(i + 7, daysInMonth) + 1
      );

      const weekTransactions = transactions.filter(
        t => t.date >= weekStart && t.date < weekEnd
      );

      const weekExpense = weekTransactions
        .filter(t => t.type === "expense")
        .reduce((a, t) => a + t.amount, 0);

      const weekIncome = weekTransactions
        .filter(t => t.type === "income")
        .reduce((a, t) => a + t.amount, 0);

      runningWeeklyExpense += weekExpense;
      runningWeeklyIncome += weekIncome;

      weeklyTrend.push({
        week: `Week ${weekIndex++}`,
        expense: weekExpense,
        income: weekIncome,
        cumulativeExpense: runningWeeklyExpense,
        cumulativeIncome: runningWeeklyIncome,
      });
    }

    // Gemini Insights
    const aiPrompt = `
      You are a financial assistant. Based on this data:
      Income: ${totalIncome}, Expense: ${totalExpense}, Savings: ${savings}
      Category Breakdown: ${JSON.stringify(categoryBreakdown)}

      Provide at least 3 clear, actionable financial insights in plain text.
    `;
    const aiAdvice = await askGemini(aiPrompt);

    // --- Response ---
    res.status(200).json({
      dashboard: {
        monthlySpending: { total: totalExpense, change: spendingChange },
        budgetRemaining: budget
          ? {
              total: budget.limit - totalExpense,
              percentRemaining: (
                ((budget.limit - totalExpense) / budget.limit) *
                100
              ).toFixed(2),
            }
          : { total: 0, percentRemaining: "0" },
        savingsRate: { amount: savings, change: savingsChange },
        budgetSummary,
        categoryBreakdown,
        dailyTrend,
      },
      reports: {
        biggestSpendingCategory: {
          category: biggestCategory,
          amount: maxAmount,
        },
        totalSavingsVsLastMonth: {
          current: savings,
          last: lastSavings,
          change: savingsChange,
        },
        avgDailySpend: { current: avgDailySpend, change: avgDailyChange },
        weeklyTrend,
      },
      charts: {
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
