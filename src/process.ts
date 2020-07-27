import * as cp from "child_process";
import * as path from "path";
import { sendEpub } from "./mail";
import { config } from "./config";
import debug from "debug";
import { getDateString } from "./utils";
import { downloadArticles } from "./download";
import { getBookmarks, markAsSent } from "./pinboard";

const log = debug("p2k:processing");
const recipeLog = debug("p2k:recipe");

export async function processArticles() {
  const dateStr = getDateString();
  const title = `${config.title} ${dateStr}`;
  const rawDataFolder = `/tmp/${dateStr}/`;
  const file = path.join(process.cwd(), `${dateStr}.mobi`);

  log("Getting bookmarks");

  const bookmarks = await getBookmarks();

  log("Downloading files");
  await downloadArticles(bookmarks, rawDataFolder);

  log("Running p2k calibre recipe for %s", dateStr);

  await new Promise((resolve, reject) => {
    const subprocess = cp.spawn(
      "ebook-convert",
      [
        "pinboard-to-kindle.recipe",
        file,
        "--title",
        title,
        "--output-profile",
        "kindle_oasis",
      ]
      // { stdio: "inherit" }
    );

    subprocess.stdout.on("data", (chunk) => {
      const line = chunk.toString().trim();
      if (line != "") {
        recipeLog(line);
      }
    });

    subprocess.stderr.on("data", (chunk) => {
      const line = chunk.toString().trim();
      if (line != "") {
        recipeLog(line);
      }
    });

    subprocess.on("error", (err) => {
      return reject(err);
    });

    subprocess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error("ebook-convert returned non-zero code"));
      }
      return resolve();
    });
  });

  log("Generated mobi: %s", file);

  log("Marking bookmarks as sent");
  bookmarks.forEach(({ bookmarks }) => {
    bookmarks.forEach(async (bookmark) => {
      await markAsSent(bookmark);
    });
  });

  log("Sending generated mobi via email");

  await sendEpub(title, file);

  log("Processing finished");
}
