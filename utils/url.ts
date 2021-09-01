export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g;

export const getUrls = (str: string) => (str?.match(URL_REGEX) || []);

export const getGoodReadsUrlFromDescription = (
  description: string | undefined,
) => {
  if (!description) return "";
  return [...getUrls(description)]
    .map(urlFromString)
    .filter((u) => u?.origin.includes("goodreads"))
    .map(sanitizeUrl)
    .pop();
};

export const urlFromString = (url: string | undefined) => {
  return url ? new URL(url) : undefined;
};

export const sanitizeUrl = (url: URL | undefined) =>
  url ? `${url.origin}${url.pathname}` : "";
