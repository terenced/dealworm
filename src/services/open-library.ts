import Fuse from "https://deno.land/x/fuse@v6.0.4/dist/fuse.esm.min.js";
import * as Fae from "../deps/fae.ts";

import { Book } from "../models/book.ts";
import { getAmazonSearchUrl } from "./amazon.ts";

export interface OpenLibBook extends Partial<Book> {
  goodreads?: string[];
}

const mapper = (item: any): OpenLibBook => {
  const isbn = Fae.head(item.isbn.filter(
    (i: string[]) => i.length === 13,
  )) as string;
  return {
    title: item.title,
    author: item.author_name,
    isbn,
    storeUrl: getAmazonSearchUrl(isbn),
    goodreads: item.id_goodreads,
  } as OpenLibBook;
};

export async function searchBookDetails(
  title: string,
  author?: string,
): Promise<OpenLibBook> {
  const searchUrl = `https://openlibrary.org/search.json?q=${
    title.replace(" ", "+")
  }`;

  const response = await fetch(searchUrl);
  const json = await response.json();
  const data = json.docs;

  if (!author) {
    return mapper(data[0]);
  }
  const fuse = new Fuse(data, {
    keys: ["author_name", "author_alternative_name"],
  });
  return Fae.head(
    fuse.search(author).map((i) => mapper(i.item)),
  );
}
