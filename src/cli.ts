#!/usr/bin/env node

import { program } from "commander";
import { writeFileSync } from "fs";
import { parseArticle } from "./download";
import { sendEpub } from "./mail";
import { processArticles } from "./process";

program
  .command("download <url> <destination>")
  .description("download an article from url into destination file")
  .action(async (url, destination) => {
    console.log(`Downloading ${url} into ${destination}`);
    const result = await parseArticle(url);
    writeFileSync(destination, result.content);
    console.log("Download completed");
  });

program
  .command("send <title> <file>")
  .description("send epub file to kindle")
  .action(async (title, file) => {
    console.log(`Sending ${file} to kinde`);
    await sendEpub(title, file);
    console.log("Mail sent");
  });

program
  .command("process")
  .description("run full processing pipeline")
  .action(async () => {
    console.log("Running processing from cli");
    await processArticles();
    console.log("Processing finished");
  });
program.parse();
