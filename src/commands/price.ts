import { Command } from "../deps/cliffy.ts";
import * as Fae from "../deps/fae.ts";
import { wait } from "../deps/wait.ts";

import {
  getStore,
  orderedUnpricedBooks,
  StoreRecord,
} from "../services/store.ts";
import { findByISBN } from "../services/amazon.ts";
import { getLogger } from "../utils/logger.ts";

export const priceCommand = new Command()
  .option("-l, --limit [type:number]", "Limit to process", { default: 3 })
  .option("-a, --all [type:boolean]", "All", { default: false })
  .option("-i, --isbn [type:string]", "Find a specifc book by ISBN")
  .action(async ({ limit, verbose, all, isbn }) => {
    const spinner = wait("Loading data");
    if (!verbose) spinner.start();
    const store = getStore();
    const logger = getLogger(verbose);
    const items = orderedUnpricedBooks(store);
    limit = all ? items.length : limit;
    const books = Fae.take(limit, items);

    let current = 1;
    for (const book of books) {
      const bookInfoText = `(${current++}/${limit}) ${book.isbn} ${book.title}`;
      spinner.text = `Pricing ${bookInfoText}`;
      logger.info(`${bookInfoText}: Pricing`);
      try {
        const am = await findByISBN(book.isbn);
        const priced = {
          ...book,
          ...am,
          updated: Date.now(),
        } as StoreRecord;
        logger.info(`${bookInfoText}: Found ${am.price}`);
        spinner.text = `Found ${am.price}`;
        store.updateAndCommit(book.isbn, priced);
      } catch (error) {
        logger.error(`${bookInfoText}: ${error}`);
        store.updateAndCommit(book.isbn, {
          ...book,
          updated: Date.now(),
        });
      }
    }
    store.save();
    spinner.succeed("All done!");
  });
