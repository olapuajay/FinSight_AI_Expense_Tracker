import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { editTransaction } from "../redux/slices/transactionSlices";

const EditTransactionModal = ({ isOpen, onClose, transaction }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: "",
    payment: "cash",
    note: "",
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date.split("T")[0], // format YYYY-MM-DD
        payment: transaction.payment,
        note: transaction.note || "",
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(editTransaction({ id: transaction._id, updatedData: form }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Transaction</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
          <textarea
            name="note"
            placeholder="Notes"
            value={form.note}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
