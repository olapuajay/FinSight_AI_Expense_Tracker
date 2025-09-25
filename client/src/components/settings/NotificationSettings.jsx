import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotificationSettings, updateNotificationSettings, resetNotificationStatus } from "../../redux/slices/notificationSettingsSlice";

const NotificationSettings = ({ userId }) => {
  const dispatch = useDispatch();
  const { settings, loading, error, success } = useSelector((state) => state.notificationSettings);

  const [formData, setFormData] = useState({
    budgetAlerts: true,
    aiInsights: { enabled: true, frequency: "daily" },
    reminders: true,
  });

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotificationSettings(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, checked, value } = e.target;

    if (name === "budgetAlerts" || name === "reminders") {
      setFormData({ ...formData, [name]: checked });
    } else if (name === "aiEnabled") {
      setFormData({ ...formData, aiInsights: { ...formData.aiInsights, enabled: checked } });
    } else if (name === "aiFrequency") {
      setFormData({ ...formData, aiInsights: { ...formData.aiInsights, frequency: value } });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateNotificationSettings({ userId, settings: formData }));
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Settings updated!</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Alerts */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="budgetAlerts"
            checked={formData.budgetAlerts}
            onChange={handleChange}
          />
          Budget Alerts
        </label>

        {/* AI Insights */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="aiEnabled"
              checked={formData.aiInsights.enabled}
              onChange={handleChange}
            />
            AI Insights
          </label>

          {formData.aiInsights.enabled && (
            <select
              name="aiFrequency"
              value={formData.aiInsights.frequency}
              onChange={handleChange}
              className="ml-6 border rounded p-1"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          )}
        </div>

        {/* Reminders */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="reminders"
            checked={formData.reminders}
            onChange={handleChange}
          />
          Daily Expense Reminder
        </label>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
