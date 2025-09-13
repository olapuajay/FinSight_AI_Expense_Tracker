import cron from "node-cron";
import { generateAiAlerts } from "../services/alertService.js";
import app from "../server.js";
import { getIO } from "../utils/socket.js";

cron.schedule("0 9,15,21 * * *", async () => {
  console.log("Running AI Alerts cron job...");
  const io = getIO();
  await generateAiAlerts(io);
}, {
  timezone: "Asia/Kolkata"
});