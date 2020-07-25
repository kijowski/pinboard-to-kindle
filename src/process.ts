import * as cp from "child_process";
import * as path from "path";
import { sendEpub } from "./mail";
import debug from "debug";

const log = debug("p2k:processing");
const recipeLog = debug("p2k:recipe");

export async function processArticles() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  const title = `Various ${year}-${month}-${day}`;
  const file = path.join(process.cwd(), `${dateStr}.mobi`);

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
      recipeLog(chunk.toString());
    });

    subprocess.stderr.on("data", (chunk) => {
      recipeLog(chunk.toString());
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
  log("Sending generated mobi via email");

  await sendEpub(title, file);

  log("Processing finished");
}
