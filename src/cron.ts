import schedule from "node-schedule";
import fastify from "fastify";
import { processArticles } from "./process";
import debug from "debug";
import { markAsRead } from "./pinboard";

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

const server = fastify();

server.route<{ Querystring: { api_key: string; url: string } }>({
  method: "GET",
  url: "/read",
  preValidation: async (request) => {
    const { api_key } = request.query;
    if (api_key !== "admin") {
      throw new Error("Invalid api_key");
    }
    // done(api_key !== "admin" ? new Error("Must be admin") : undefined); // only validate `admin` account
  },
  handler: async (request, reply) => {
    const { url } = request.query;
    const decoded = decodeURIComponent(url);
    await markAsRead(decoded);
    console.log(decoded);
    return "IT IS OK";
  },
});

server.listen(8800, (err, addr) => {
  console.log(err);
  console.log(addr);
});
