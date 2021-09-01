import { stripHtml } from "http://esm.sh/string-strip-html";

import { getGoodReadsUrlFromDescription } from "../utils/url.ts";
export interface Value {
  value: string;
}

export interface Link {
  href: string;
}

export interface GoodReadsFeedEntry {
  book_id: Value;
  book_image_url: Value;
  book_small_image_url: Value;
  book_medium_image_url: Value;
  book_large_image_url: Value;
  book_description: Value;
  book: { id: string; num_pages: Value };
  author_name: Value;
  isbn: Value;
  user_name: Value;
  user_rating: Value;
  user_date_added: Value;
  user_date_created: Value;
  user_shelves: Value;
  average_rating: Value;
  book_published: Value;
  id: string;
  title: Value;
  description: Value;
  published: string;
  publishedRaw: string;
  updated: string;
  updatedRaw: string;
  links: Link[];
}

export interface GoodReads {
  title: string;
  imageUrl: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  largeImageUrl: string;
  description: string;
  isbn: string;
  published: string;
  url: string;
}

const imgPlaceholder = "https://via.placeholder.com/250x350.png?text=Missing";

export function toGoodReads(entry: GoodReadsFeedEntry) {
  return {
    title: entry?.title?.value,
    imageUrl: entry?.book_image_url?.value || imgPlaceholder,
    smallImageUrl: entry?.book_small_image_url?.value || imgPlaceholder,
    mediumImageUrl: entry?.book_medium_image_url?.value || imgPlaceholder,
    largeImageUrl: entry?.book_large_image_url?.value || imgPlaceholder,
    description: stripHtml(entry?.book_description?.value || "").result,
    isbn: entry?.isbn?.value || "",
    published: entry?.published || "",
    url: getGoodReadsUrlFromDescription(entry?.description?.value),
  };
}
