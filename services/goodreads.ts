import { parseFeed } from "https://deno.land/x/rss@0.5.3/mod.ts";

interface Value {
  value: string;
}

interface Link {
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

export async function getItemsFromFeed(url: string) {
  const response = await fetch(url);
  const xml = await response.text();
  const feed = await parseFeed(xml);
  return feed.entries as unknown as GoodReadsFeedEntry[];
}
