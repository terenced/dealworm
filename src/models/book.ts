import { SearchResult } from "./searchResult.ts";

export interface BaseBook {
  title: string;
  imageUrl: string;
  description: string;
  isbn: string;
  published: string;
  url: string;
  price?: number;
  created?: number;
}
export type Book = SearchResult & BaseBook;
