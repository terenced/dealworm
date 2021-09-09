import { LocalStorage } from "https://deno.land/x/storage@0.0.5/mod.ts";
import { BookRecord } from "../models/book.ts";
export function getStore() {
  const store = new LocalStorage<BookRecord>();
  return store;
}

export function allBooks(store = getStore()) {
  return store.values();
}

export function booksToPrice(store = getStore()) {
  const books = store.values();
  return books.filter((b) => !b.price);
}
export function pricedBooks(store = getStore()) {
  const books = store.values();
  return books.filter((b) => b.price);
}
