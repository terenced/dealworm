import { Command } from "cliffy/mod.ts";
import { default as chalkin } from "chalkin";
import * as Fae from "fae";

import {
  allBooks,
  getStore,
  orderedUnpricedBooks,
  pricedBooks,
} from "src/services/store.ts";

import { Book } from "src/models/book.ts";
import { printRecords, printRecordsRaw } from "src/utils/printer.ts";

export const listCommand = new Command()
  .option("-p, --priced [type:boolean]", "All items with price")
  .option("-u, --unpriced [type:boolean]", "All items missing prices")
  .option("-o, --outdated [type:boolean]", "Outdated items")
  .option("-c, --count [type:boolean]", "Display the count of items")
  .option("-l, --limit [type:number]", "Limit to process")
  .option("-i, --isbn [type:string]", "Find a specifc book by ISBN")
  .option("-r, --raw [type:boolean]", "Print raw values")
  .action(({ prices, unpriced, limit, isbn, raw, count }) => {
    const store = getStore();
    let items: Book[];
    const printFn = raw ? printRecordsRaw : printRecords;

    if (isbn) {
      const item = store.get(isbn);
      if (!item) {
        console.error(
          `${chalkin.red("Error: ")}Book with ISBN '${
            chalkin.bold(isbn)
          }' not found. Try running the 'price' command`,
        );
        return;
      }
      items = [item];
    } else if (unpriced) {
      items = orderedUnpricedBooks(store);
    } else if (prices) {
      items = pricedBooks(store);
    } else {
      items = allBooks(store);
    }
    if (limit) {
      items = Fae.take(
        limit,
        items,
      ) as unknown as Book[];
    }
    if (count) {
      console.log(items.length);
    } else {
      printFn(items);
    }
  });
