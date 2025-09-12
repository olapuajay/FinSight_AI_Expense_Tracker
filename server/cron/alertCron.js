import cron from "node-cron";
import { generateAiAlerts } from "../services/alertService.js";

cron.schedule("0 9, 15, 21 * * *", async () => {
  console.log("Generating AI alerts...");
  await generateAiAlerts();
});