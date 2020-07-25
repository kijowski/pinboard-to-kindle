import schedule from "node-schedule";
import { processArticles } from "./process";
import debug from "debug";

const log = debug("p2k:cron");

const job = schedule.scheduleJob(
  "Generate",
  { dayOfWeek: 5, hour: 8 },
  async () => {
    log("Processing triggered");
    await processArticles();
    log("Processing finished");
  }
);
