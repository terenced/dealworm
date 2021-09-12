import { Command } from "../deps/cliffy.ts";
import * as Fae from "../deps/fae.ts";

import {
  allBooks,
  getStore,
  pricedBooks,
  StoreRecord,
  unpricedBooks,
} from "../services/store.ts";

import { printRecords } from "../utils/printer.ts";

export const listCommand = new Command()
  .option("-p, --prices [type:boolean]", "All items with price")
  .option("-m, --missing [type:boolean]", "All items missing prices")
  .option("-l, --limit [type:number]", "Limit to process")
  .action(({ prices, missing, limit }) => {
    const store = getStore();
    let items: StoreRecord[];
    if (missing) {
      items = unpricedBooks(store);
    } else if (prices) {
      items = pricedBooks(store);
    } else {
      items = allBooks(store);
    }
    if (limit) {
      items = Fae.take(limit, items);
    }
    printRecords(items);
  });
