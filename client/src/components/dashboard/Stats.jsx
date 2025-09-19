import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardSummary } from "../../redux/slices/dashboardSlice";

const Stats = ({ userId }) => {
  const dispatch = useDispatch();
  const { summary, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const today = new Date();
    dispatch(
      fetchDashboardSummary({
        userId,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      })
    );
  }, [dispatch, userId]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="animate-pulse text-gray-500">Loading your stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 font-medium">
          {error.includes("overloaded") ? "The stats service is overloaded right now." : error}
        </p>
      </div>
    );
  }
  if (!summary) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data available for this month.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="p-4 bg-white rounded-2xl shadow">
          <h3 className="md:text-lg text-sm font-semibold">Monthly Spending</h3>
          <p className="md:text-2xl text-lg font-bold text-red-600">
            ₹{summary.monthlySpending.total}
          </p>
          <p className="md:text-sm text-xs text-gray-500">
            Change: {summary.monthlySpending.change}%
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow">
          <h3 className="md:text-lg text-sm font-semibold">Savings Rate</h3>
          <p className="md:text-2xl text-lg font-bold text-green-600">
            ₹{summary.savingsRate.amount} / ₹{summary.savingsRate.target}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.savingsRate.percent}%{" "}
            {summary.savingsRate.percent >= 75
              ? "On track"
              : summary.savingsRate.percent >= 50
              ? "Needs improvement"
              : "At risk"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow">
          <h3 className="md:text-lg text-sm font-semibold">Budget Remaining</h3>
          <p className="md:text-2xl text-lg font-bold text-blue-600">
            ₹{summary.budgetRemaining.total}
          </p>
          <div className="flex flex-row-reverse gap-2 w-2/3">
            <p className="md:text-sm text-xs text-gray-500">
              {(summary.budgetRemaining.percentRemaining)}%
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full ${
                  100 - summary.budgetRemaining.percentRemaining >= 100
                    ? "bg-red-500"
                    : 100 - summary.budgetRemaining.percentRemaining >= 80
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${Math.min(
                    100 - summary.budgetRemaining.percentRemaining,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div className="md:col-span-4 col-span-12 p-4 bg-white rounded-2xl shadow">
          <h3 className="md:text-lg text-sm font-semibold">Budget Summary</h3>
          <p className="md:text-sm text-xs text-green-600">
            {summary.budgetSummary.underBudget} categories under budget
          </p>
          <p className="md:text-sm text-xs text-yellow-600">
            {summary.budgetSummary.nearLimit} categories near the limit
          </p>
          <p className="md:text-sm text-xs text-red-600">
            {summary.budgetSummary.overLimit} categories over the limit
          </p>
        </div>

        <div className="md:col-span-8 col-span-12 p-4 bg-white rounded-2xl shadow">
          <h4 className="text-md font-semibold">Category Breakdown</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            {Object.entries(summary.categoryBreakdown).map(([cat, data]) => {
              const percent = Math.round(data.percent);
              return (
                <div key={cat} className="col-span-1">
                  <p className="text-sm font-medium capitalize">{cat}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percent >= 100
                          ? "bg-red-500"
                          : percent >= 80
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percent}%{" "}
                    {percent >= 100
                      ? "(Over budget)"
                      : percent >= 80
                      ? "(Warning)"
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
