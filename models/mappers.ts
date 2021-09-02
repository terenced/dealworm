import { stripHtml } from "http://esm.sh/string-strip-html";
import { getGoodReadsUrlFromDescription } from "../utils/url.ts";
import { GoodReads, GoodReadsFeedEntry } from "./goodreads.ts";
import { Record } from "./record.ts";

const imgPlaceholder = "https://via.placeholder.com/250x350.png?text=Missing";
export function toGoodReads(entry: GoodReadsFeedEntry): GoodReads {
  return {
    title: entry?.title?.value,
    imageUrl: entry?.book_image_url?.value || imgPlaceholder,
    smallImageUrl: entry?.book_small_image_url?.value || imgPlaceholder,
    mediumImageUrl: entry?.book_medium_image_url?.value || imgPlaceholder,
    largeImageUrl: entry?.book_large_image_url?.value || imgPlaceholder,
    description: stripHtml(entry?.book_description?.value || "").result,
    isbn: entry?.isbn?.value || "",
    published: entry?.published || "",
    url: getGoodReadsUrlFromDescription(entry?.description?.value) || "",
  };
}

const getImageUrl = (
  entry: GoodReadsFeedEntry,
) => (
  entry.book_image_url.value ??
    entry.book_large_image_url.value ??
    entry.book_medium_image_url.value ??
    entry.book_small_image_url.value ??
    imgPlaceholder
);

export function toRecord(entry: GoodReadsFeedEntry): Record {
  return {
    title: entry?.title?.value,
    imageUrl: getImageUrl(entry),
    description: stripHtml(entry?.book_description?.value || "").result,
    isbn: entry?.isbn?.value || "",
    published: entry?.published || "",
    url: getGoodReadsUrlFromDescription(entry?.description?.value) || "",
  };
}
