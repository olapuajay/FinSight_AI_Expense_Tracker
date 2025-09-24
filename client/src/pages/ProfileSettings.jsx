// src/pages/ProfileSettings.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from '../redux/slices/profileSlice';
import { logout } from '../redux/slices/authSlice';
import { getBudget, setBudget, updateBudget, deleteBudget } from "../redux/slices/budgetSlice";
import Navbar from '../components/Navbar';
import profilePhoto from "../assets/profile.png";
import { Mail } from 'lucide-react';

const categories = [
  "groceries",
  "food",
  "shopping",
  "travel",
  "entertainment",
  "bills",
  "utilities",
  "rent",
  "other",
];

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.profile);
  const { budget, loading: budgetLoading } = useSelector((state) => state.budget);

  const [formData, setFormData] = useState({
    name: "", email: "", currency: "", password: "",
    notificationPreferences: {
      budgetAlerts: true,
      aiInsights: { enabled: true, frequency: "daily" },
      reminders: true,
    },
  });

  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [targetSavings, setTargetSavings] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState([]);

  // Load profile
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Load budget when user is available
  useEffect(() => {
    if (user?._id) {
      const now = new Date();
      dispatch(getBudget({ userId: user._id, month: now.getMonth() + 1, year: now.getFullYear() }));
    }
  }, [dispatch, user?._id]);

  // Prefill profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ...user,
        notificationPreferences: {
          ...prev.notificationPreferences,
          ...(user.notificationPreferences || {}),
        },
      }));
    }
  }, [user]);

  // Prefill budget
  useEffect(() => {
    if (budget) {
      setMonthlyLimit(budget.limit);
      setTargetSavings(budget.targetSavings || "");
      setCategoryBudgets(budget.categoryBudgets || []);
    }
  }, [budget]);

  // Profile Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [parent]: {
            ...prev.notificationPreferences[parent],
            [child]: type === "checkbox" ? checked : value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }
    dispatch(updateProfile(payload));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Budget Handlers
  const handleCategoryChange = (cat, value) => {
    setCategoryBudgets((prev) =>
      prev.map((c) => (c.category === cat ? { ...c, categoryLimit: Number(value) } : c))
    );
  };

  const handleAddCategory = (cat) => {
    if (!categoryBudgets.some((c) => c.category === cat)) {
      setCategoryBudgets([...categoryBudgets, { category: cat, categoryLimit: 0 }]);
    }
  };

  const handleSaveBudget = () => {
    const now = new Date();
    const payload = {
      limit: Number(monthlyLimit),
      targetSavings: Number(targetSavings),
      categoryBudgets: categoryBudgets.map(c => ({
        category: c.category,
        categoryLimit: Number(c.categoryLimit),
      })),
    };

    if (budget?._id) {
      dispatch(updateBudget({ id: budget._id, budget: payload }));
    } else {
      dispatch(setBudget({ ...payload, userId: user._id, month: now.getMonth() + 1, year: now.getFullYear() }));
    }
  };

  const handleDeleteBudget = () => {
    if (budget?._id) {
      dispatch(deleteBudget(budget._id));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="md:px-16 px-2 mt-4">
        <h2 className="md:text-2xl text-lg font-bold mb-4">Profile & Settings</h2>

        {/* Header with profile and logout */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <img
              src={profilePhoto}
              alt="Profile"
              className="md:w-16 md:h-16 w-12 h-12 rounded-full border"
            />
            <div>
              <h2 className="md:text-lg text-md font-bold">{user?.name}</h2>
              <div className="text-gray-600 flex gap-1">
                <Mail className="h-4 w-4 mt-1" />
                <p className="text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white md:text-md text-sm md:px-4 md:py-2 px-2 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Profile Update Section */}
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mb-10">
              <div>
                <h3 className="md:text-lg text-md font-semibold mb-2">Update Profile</h3>
                <div>
                  <label className="md:text-sm text-xs font-medium text-[#6B7280]">Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-sm md:text-base text-[#6B7280] outline-0 focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="md:text-sm text-xs font-medium text-[#6B7280]">Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-sm md:text-base text-[#6B7280] outline-0 focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="md:text-sm text-xs font-medium text-[#6B7280]">New Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-sm md:text-base text-[#6B7280] outline-0 focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Budget Section */}
              <div>
                <h2 className="md:text-lg text-md font-semibold mb-2">Budget Settings</h2>

                <div>
                  <label className="md:text-sm text-xs font-medium text-[#6B7280]">Monthly Budget (₹)</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-sm md:text-base text-[#6B7280] outline-0 focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="md:text-sm text-xs font-medium text-[#6B7280]">Target Savings (₹)</label>
                  <input
                    type="number"
                    value={targetSavings}
                    onChange={(e) => setTargetSavings(e.target.value)}
                    className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-sm md:text-base text-[#6B7280] outline-0 focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <h3 className="text-md font-semibold mt-4">Category Budgets</h3>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-[#6B7280] border-collapse">
                      <thead className="bg-[#E5E7EB]">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm md:text-base uppercase text-[#2563EB]">Category</th>
                          <th className="px-4 py-2 text-left text-sm md:text-base uppercase text-[#2563EB]">Limit (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryBudgets.map((cat, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 capitalize text-sm md:text-base">{cat.category}</td>
                            <td className="px-4 py-2 text-sm md:text-base">
                              <input
                                type="number"
                                value={cat.categoryLimit}
                                onChange={(e) => handleCategoryChange(cat.category, e.target.value)}
                                className="w-full p-1 border-2 border-[#6B7280] rounded text-[#6B7280] outline-0 focus:border-[#2563EB]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <label className="md:text-sm text-xs font-medium text-[#6B7280]">Add Category</label>
                    <select
                      onChange={(e) => handleAddCategory(e.target.value)}
                      className="w-full p-2 border-2 border-[#6B7280] text-sm md:text-base rounded-lg mb-2 text-[#6B7280] outline-0 focus:border-[#2563EB]"
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter((c) => !categoryBudgets.some((cb) => cb.category === c))
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 md:mt-4 mt-2">
                  <button
                    onClick={handleSaveBudget}
                    disabled={budgetLoading}
                    className="bg-blue-600 text-white text-sm md:text-base md:px-4 md:py-2 px-2 py-1 rounded hover:bg-blue-700"
                  >
                    {budget ? "Update Budget" : "Set Budget"}
                  </button>
                  {budget && (
                    <button
                      onClick={handleDeleteBudget}
                      className="bg-red-500 text-white text-sm md:text-base md:px-4 md:py-2 px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete Budget
                    </button>
                  )}
                </div>
              </div>


              {/* Notifications */}
              <div>
                <h3 className="md:text-lg text-md font-semibold mb-2">Notifications</h3>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="budgetAlerts"
                    checked={formData.notificationPreferences.budgetAlerts}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Budget Alerts
                </label>

                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="aiInsights.enabled"
                    checked={formData.notificationPreferences.aiInsights.enabled}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  AI Insights
                </label>

                {formData.notificationPreferences.aiInsights.enabled && (
                  <select
                    name="aiInsights.frequency"
                    value={formData.notificationPreferences.aiInsights.frequency}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}

                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="reminders"
                    checked={formData.notificationPreferences.reminders}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Reminders
                </label>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
