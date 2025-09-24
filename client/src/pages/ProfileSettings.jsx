import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfile } from '../redux/slices/profileSlice';
import { logout } from '../redux/slices/authSlice';
import Navbar from '../components/Navbar';
import profilePhoto from "../assets/profile.png"
import { Mail } from 'lucide-react';

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    name: "", email: "", currency: "", password: "",
    notificationPreferences: {
      budgetAlerts: true,
      aiInsights: { enabled: true, frequency: "daily" },
      reminders: true,
    },
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if(user) {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if(name.includes(".")) {
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
  }

  return (
    <div>
      <Navbar />  
      <div className='md:px-16 px-2 mt-4'>
        <h2 className="md:text-2xl text-lg font-bold mb-4">Profile & Settings</h2>
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <img
              src={profilePhoto} 
              alt="Profile"
              className="md:w-16 md:h-16 w-12 h-12 rounded-full border"
            />
            <div>
              <h2 className="md:text-lg text-md font-bold">{user?.name}</h2>
              <div className='text-gray-600 flex gap-1'>
                <Mail className='h-4 w-4 mt-1' />
                <p className='text-sm'>{user?.email}</p>
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
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="md:text-lg text-md font-semibold mb-2">Update Profile</h3>
                  <div>
                    <label className='text-sm font-medium text-[#6B7280]'>Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-[#6B7280] outline-0"
                    />
                  </div>
                  <div>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-[#6B7280]'>Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-[#6B7280] outline-0"
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-[#6B7280]'>New Password</label>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="New Password"
                      className="w-full p-2 border-2 border-[#6B7280] rounded-lg mb-2 text-[#6B7280] outline-0"
                    />
                  </div>
                </div>

                {/* Notification Settings */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
