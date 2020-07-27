import { JSDOM } from "jsdom";
import Readability from "readability";
import { Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox";
import { useFirefox, useReadability } from "./blacklist";
import debug from "debug";
import * as fs from "fs";
import { PinboardBookmark } from "./pinboard";

const log = debug("p2k:download");

function countWords(str: string) {
  return str.trim().split(/\s+/).length;
}

async function firefoxPageSource(url: string) {
  var options = new firefox.Options();
  options.addArguments("-headless");
  const driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();
  try {
    await driver.get(url);
    await driver.sleep(5000);
    const pageSource = await driver.getPageSource();
    return pageSource;
  } finally {
    await driver.quit();
  }
}

async function jsomPageSource(url: string) {
  return JSDOM.fromURL(url).then((dom) => {
    return dom.window.document.documentElement.outerHTML;
  });
}

export async function parseArticle(url: string) {
  log("Downloading %s", url);
  let getPageSource = jsomPageSource;
  if (useFirefox(url)) {
    log("Using firefox driver");
    getPageSource = firefoxPageSource;
  } else {
    log("Using JSDOM driver");
  }
  const pageSource = await getPageSource(url);
  let res = [];

  log("Parsing DOM");
  const dom = new JSDOM(pageSource, { url });
  let reader = new Readability(dom.window.document, {});
  let article = reader.parse();
  let articleHtml = pageSource;
  if (useReadability(url)) {
    log("Using readability library");
    articleHtml = article.content;
  }

  // Base path for images and other media
  res.push('<base href="' + url + '" />');

  // Meta data (sub title, site name, word count)
  const title = article?.title ?? "";
  const subtitle = article?.byline ?? "";
  const siteName = article?.siteName ?? "";
  const length = countWords(article.textContent) + " words";
  let meta = [];
  if (subtitle != "") {
    meta.push(subtitle);
  }
  if (siteName != "") {
    meta.push(siteName);
  }
  meta.push(countWords(article.textContent) + " words");

  // Article links
  let links = [];
  links.push(
    '<a id="pb-to-kindle-article-link" href="' + url + '">Article link</a>'
  );

  // Output
  if (title != "") {
    res.push('<h2 id="pb-to-kindle-article-title">' + article.title + "</h2>");
  }
  res.push(
    '<p><i id="pb-to-kindle-article-metadata">' + meta.join(" • ") + "</i></p>"
  );
  res.push(
    '<p><i id="pb-to-kindle-article-links">' + links.join(" • ") + "</i></p>"
  );
  res.push("<hr>");
  res.push(articleHtml);
  res.push("<hr>");
  res.push("<p><i>" + links.join(" • ") + "</i></p>");

  return { title, subtitle, length, siteName, content: res.join("\n") };
}

export async function downloadArticles(
  allBookmarks: { tag: string; bookmarks: PinboardBookmark[] }[],
  rawDataFolder: string
) {
  if (!fs.existsSync(rawDataFolder)) {
    fs.mkdirSync(rawDataFolder);
  }
  for (const { tag, bookmarks } of allBookmarks) {
    for (const bookmark of bookmarks) {
      const parsed = await parseArticle(bookmark.href);
      const localFile = `${rawDataFolder}/${bookmark.hash}.html`;

      fs.writeFileSync(localFile, parsed.content);

      const metadata = {
        title: parsed.title,
        url: bookmark.href,
        description: [
          bookmark.description || parsed.subtitle,
          parsed.length,
        ].join(" • "),
        tag,
        localFile,
      };

      fs.writeFileSync(
        `${rawDataFolder}/${bookmark.hash}.json`,
        JSON.stringify(metadata)
      );
    }
  }
}
