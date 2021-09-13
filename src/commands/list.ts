import { Command } from "../deps/cliffy.ts";
import * as Fae from "../deps/fae.ts";
import { chalkin } from "../deps/chalkin.ts";

import {
  allBooks,
  getStore,
  orderedUnpricedBooks,
  pricedBooks,
  StoreRecord,
} from "../services/store.ts";

import { printRecords, printRecordsRaw } from "../utils/printer.ts";

export const listCommand = new Command()
  .option("-p, --priced [type:boolean]", "All items with price")
  .option("-u, --unpriced [type:boolean]", "All items missing prices")
  .option("-l, --limit [type:number]", "Limit to process")
  .option("-i, --isbn [type:string]", "Find a specifc book by ISBN")
  .option("-r, --raw [type:boolean]", "Print raw values")
  .action(({ prices, unpriced, limit, isbn, raw }) => {
    const store = getStore();
    let items: StoreRecord[];
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
      items = Fae.take(limit, items);
    }
    printFn(items);
  });
