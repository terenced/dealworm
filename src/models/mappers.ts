import { stripHtml } from "string-strip-html";
import { getGoodReadsUrlFromDescription } from "src/utils/url.ts";
import { GoodReadsFeedEntry } from "./goodreads.ts";
import { Book } from "./book.ts";

import isbn3 from "isbn3";

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
  return {
    isbn: isbn3.asIsbn13(entry?.isbn?.value || ""),
    description: stripHtml(entry?.book_description?.value || "")?.result,
    imageUrl: getImageUrl(entry),
    published: entry?.published || "",
    title: entry?.title?.value,
    url: getGoodReadsUrlFromDescription(entry?.description?.value) || "",
  };
}
