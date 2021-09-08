import { stripHtml } from "http://esm.sh/string-strip-html";
import { getGoodReadsUrlFromDescription } from "../utils/url.ts";
import { GoodReadsFeedEntry } from "./goodreads.ts";
import { Book } from "./book.ts";

const imgPlaceholder = "https://via.placeholder.com/250x350.png?text=Missing";

const getImageUrl = (
  entry: GoodReadsFeedEntry,
) => (
  entry.book_image_url.value ??
    entry.book_large_image_url.value ??
    entry.book_medium_image_url.value ??
    entry.book_small_image_url.value ??
    imgPlaceholder
);

export function toBook(entry: GoodReadsFeedEntry): Book {
  return new Book(
    entry?.isbn?.value || "",
    stripHtml(entry?.book_description?.value || "")?.result,
    getImageUrl(entry),
    entry?.published || "",
    entry?.title?.value,
    getGoodReadsUrlFromDescription(entry?.description?.value) || "",
  );
}
