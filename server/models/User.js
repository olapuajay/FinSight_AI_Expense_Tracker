import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    currency: { type: String, default: "INR" },
    profilePic: { type: String, default: "" },

    notificationPreferences: {
      budgetAlerts: { type: Boolean, default: true },
      aiInsights: {
        enabled: { type: Boolean, default: true },
        frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
      },
      reminders: { type: Boolean, default: true },
    },
  }, { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;