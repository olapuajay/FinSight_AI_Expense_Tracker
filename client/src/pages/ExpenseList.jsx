import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteTransaction, fetchTransactions } from '../redux/slices/transactionSlices';
import EditTransactionModal from '../components/EditTransactionModal';
import Navbar from '../components/Navbar';


const categories = ["Groceries", "Food", "Transport", "Entertainment", 'Bills', "Other"];
const paymentMethods = ["cash", "upi", "card"];
const amountRanges = [
  { label: "Below ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹2000", min: 500, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: Infinity },
];

function ExpenseList() {
  const { transactions } = useSelector((state) => state.transactions);
  
  const dispatch = useDispatch();

  const [editingTx, setEditingTx] = useState(null);
  
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectedAmounts, setSelectedAmounts] = useState([]);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const filteredTransactions = transactions.filter((tx) => {
    if(search && !tx.category.toLowerCase().includes(search.toLowerCase()) && !tx.note?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    const txDate = new Date(tx.date);
    const today = new Date();
    if(dateRange === "today" && txDate.toDateString() !== today.toDateString()) return false;
    if(dateRange === "thisWeek") {
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      if(txDate < startOfWeek) return false;
    }

    if(dateRange === "thisMonth" && txDate.getMonth() !== new Date().getMonth()) return false;
    if(dateRange === "prevMonth") {
      const prevMonth = new Date();
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      if(txDate.getMonth() !== prevMonth.getMonth()) return false;
    }

    if (selectedCategories.length > 0) {
      const txCategoryLower = tx.category.toLowerCase();
      const selectedLower = selectedCategories.map(c => c.toLowerCase());
      if (!selectedLower.includes(txCategoryLower)) return false;
    }

    if(selectedPayments.length > 0 && !selectedPayments.includes(tx.payment)) return false;

    if(selectedAmounts.length > 0) {
      let inRange = false;
      for(const range of selectedAmounts) {
        if(tx.amount >= range.min && tx.amount <= range.max) {
          inRange = true;
          break;
        }
      }
      if(!inRange) return false;
    }

    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if(sortBy === "newest") return new Date(b.date) - new Date(a.date);
    if(sortBy === "oldest") return new Date(a.date) - new Date(b.date);
    if(sortBy === "lowToHigh") return a.amount - b.amount;
    if(sortBy === "highToLow") return b.amount - a.amount;
    return 0;
  });

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const togglePayment = (p) => {
    setSelectedPayments((prev) =>
      prev.includes(p) ? prev.filter((c) => c !== p) : [...prev, p]
    );
  };

  const toggleAmount = (range) => {
    setSelectedAmounts((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  return (
    <div>
      <Navbar />
      <div className="md:px-16 px-2 my-4 bg-gray-50 min-h-screen">
        <h1 className="md:text-2xl text-lg font-bold mb-4">Expense List</h1>

        {/* Search + Filters */}
        <div className="bg-white shadow-md rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by category or notes..."
            className="border rounded-lg p-2 w-full md:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Date Range</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="prevMonth">Previous Month</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-md rounded-2xl p-4 mb-6 grid md:grid-cols-3 gap-6">
          {/* Category */}
          <div>
            <h3 className="font-medium mb-2">Category</h3>
            {categories.map((cat) => (
              <label key={cat} className="block">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="mr-2"
                />
                {cat}
              </label>
            ))}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium mb-2">Payment Method</h3>
            {paymentMethods.map((p) => (
              <label key={p} className="block capitalize">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(p)}
                  onChange={() => togglePayment(p)}
                  className="mr-2"
                />
                {p}
              </label>
            ))}
          </div>

          {/* Amount Range */}
          <div>
            <h3 className="font-medium mb-2">Amount Range</h3>
            {amountRanges.map((range) => (
              <label key={range.label} className="block">
                <input
                  type="checkbox"
                  checked={selectedAmounts.includes(range)}
                  onChange={() => toggleAmount(range)}
                  className="mr-2"
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-2xl p-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Payment</th>
                <th className="py-2 px-4">Notes</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-b hover:bg-gray-50 text-sm text-gray-700"
                  >
                    <td className="py-2 px-4">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        tx.type === "expense" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {tx.type === "expense" ? "-" : "+"}₹{tx.amount}
                    </td>
                    <td className="py-2 px-4">{tx.category}</td>
                    <td className="py-2 px-4 capitalize">{tx.payment}</td>
                    <td className="py-2 px-4 truncate max-w-[150px]">
                      {tx.note || "-"}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setEditingTx(tx)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => dispatch(deleteTransaction(tx._id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <EditTransactionModal
            isOpen={!!editingTx}
            onClose={() => setEditingTx(null)}
            transaction={editingTx}
          />
        </div>
      </div>
    </div>
  )
}

export default ExpenseList
