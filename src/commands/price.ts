import { Command } from "../deps/cliffy.ts";
import * as Fae from "../deps/fae.ts";

import { getStore, StoreRecord, unpricedBooks } from "../services/store.ts";
import { findByISBN } from "../services/amazon.ts";

export const priceCommand = new Command()
  .option("-l, --limit [type:number]", "Limit to process", { default: 3 })
  .action(async ({ limit }) => {
    const store = getStore();
    const books = Fae.take(limit ?? 3, unpricedBooks(store));
    for (const book of books) {
      console.log(book.isbn, book.title);
      const am = await findByISBN(book.isbn);
      const priced = { ...book, ...am } as StoreRecord;
      store.override(book.isbn, priced);
    }
    store.save();
  });
