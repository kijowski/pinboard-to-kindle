import { config } from "./config";
import got from "got";

type PinboardBookmark = {
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
  return Promise.all(
    tags.map(async (tag) => {
      console.log(`Downloading for ${tag}`);
      const bookmarks = await pinboard("posts/all", {
        searchParams: { tag },
      }).json<PinboardBookmark[]>();
      return { tag, bookmarks };
    })
  );
};
