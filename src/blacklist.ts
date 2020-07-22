import { URL } from "url";

// Don't use Firefox for these domains. Will use JSDOM to fetch page source instead.
const CHROME_DOMAIN_BLACKLIST = ["spiegel.de"];

// Don't use Readability for these domains. Will use full page HTML instead.
const READABILITY_DOMAIN_BLACKLIST = ["newyorker.com"];

function isInBlacklist(url: string, blacklist: string[]) {
  let parsed_url = new URL(url);
  let hostname = parsed_url.hostname.toLowerCase();
  for (const blacklisted_domain of blacklist) {
    if (hostname.endsWith(blacklisted_domain.toLowerCase())) {
      return true;
    }
  }
  return false;
}

export function useChrome(url: string) {
  return !isInBlacklist(url, CHROME_DOMAIN_BLACKLIST);
}

export function useReadability(url: string) {
  return !isInBlacklist(url, READABILITY_DOMAIN_BLACKLIST);
}
