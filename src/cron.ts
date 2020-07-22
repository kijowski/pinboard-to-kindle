import schedule from "node-schedule";
import { processArticles } from "./process";

const job = schedule.scheduleJob(
  "Generate",
  { dayOfWeek: 5, hour: 8 },
  async () => {
    console.log("Cron started article processing");
    await processArticles();
    console.log("Cron finished article processing");
  }
);
