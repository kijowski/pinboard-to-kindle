#!/usr/bin/env node

import { program } from "commander";
import { writeFileSync } from "fs";
import { parseArticle } from "./download";
import { sendEpub } from "./mail";
import { processArticles } from "./process";
import debug from "debug";

const log = debug("p2k:cli");

program
  .command("download <url> <destination>")
  .description("download an article from url into destination file")
  .action(async (url, destination) => {
    log(`Downloading ${url} into ${destination}`);
    const result = await parseArticle(url);
    writeFileSync(destination, result.content);
    log("Download completed");
  });

program
  .command("send <title> <file>")
  .description("send epub file to kindle")
  .action(async (title, file) => {
    log(`Sending ${file} to kinde`);
    await sendEpub(title, file);
    log("Mail sent");
  });

program
  .command("process")
  .description("run full processing pipeline")
  .action(async () => {
    log("Processing triggered");
    await processArticles();
    log("Processing finished");
  });

program.parse();
