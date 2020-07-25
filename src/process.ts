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
  const title = `Various ${year}-${month}-${day}`;
  const file = `various-${year}-${month}-${day}.mobi`;
  const command = `ebook-convert pinboard-to-kindle.recipe ${file} --title "${title}" --output-profile kindle_pw3`;
  console.log(`Executing: ${command}`);
  cp.execSync(command, { encoding: "utf-8" });
  await sendEpub(title, file);

  log("Processing finished");
}
