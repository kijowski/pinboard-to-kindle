import { config } from "./config";
import got from "got";
import debug from "debug";

const log = debug("p2k:pinboard");

export type PinboardBookmark = {
  href: string;
  description: string;
  extended: string;
  meta: string;
  hash: string;
  time: string;
  shared: "yes" | "no";
  toread: "yes" | "no";
  tags: string; //"clojure book";
};

const pinboard = got.extend({
  prefixUrl: "https://api.pinboard.in/v1/",
  searchParams: { auth_token: config.pinboardToken, format: "json" },
});

export const getBookmarks = async () => {
  const tags = config.kindleToSendTag.split(" ");
  const sentTag = config.kindleSentTag;
  return Promise.all(
    tags.map(async (tag) => {
      log(`Getting bookmarks for ${tag}`);
      const allBookmarks = await pinboard("posts/all", {
        searchParams: { tag },
      }).json<PinboardBookmark[]>();

      log(`Got ${allBookmarks.length} bookmarks for ${tag}`);
      const bookmarks = allBookmarks.filter(
        (bookmark) =>
          !bookmark.tags.includes(sentTag) && bookmark.toread === "yes"
      );

      log(`Got ${bookmarks.length} bookmarks for ${tag} ready to be processed`);
      return { tag, bookmarks };
    })
  );
};

export const markAsSent = async (bookmark: PinboardBookmark) => {
  try {
    log(`Adding ${config.kindleSentTag} tag to ${bookmark.href}`);
    await pinboard("posts/add", {
      searchParams: {
        url: bookmark.href,
        description: bookmark.description,
        extended: bookmark.extended,
        tags: [...bookmark.tags.split(" "), config.kindleSentTag].join(" "),
        dt: bookmark.time,
        replace: "yes",
        shared: bookmark.shared,
        toread: bookmark.toread,
      },
    });
  } catch (err) {
    log(`Failed to modify ${bookmark.href}`);
  }
};

export const markAsRead = async (url: string) => {
  try {
    log(`Getting bookmark for ${url}`);
    const bookmarks = await pinboard("posts/get", {
      searchParams: { url },
    }).json<PinboardBookmark[]>();

    if (bookmarks.length === 0) {
      throw new Error(`Failed to find bookmark for ${url}`);
    }

    const bookmark = bookmarks[0];

    log(`Marking ${bookmark.href} as read`);
    await pinboard("posts/add", {
      searchParams: {
        url: bookmark.href,
        description: bookmark.description,
        extended: bookmark.extended,
        tags: bookmark.tags,
        dt: bookmark.time,
        replace: "yes",
        shared: bookmark.shared,
        toread: "no",
      },
    });
  } catch (err) {
    log(
      `Failed to mark ${url} as read due to ${
        err?.message ?? JSON.stringify(err)
      }`
    );
  }
};
