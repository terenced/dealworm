import { Command } from "../deps/cliffy.ts";
import * as Fae from "../deps/fae.ts";
import { wait } from "../deps/wait.ts";

import { getStore, StoreRecord, unpricedBooks } from "../services/store.ts";
import { findByISBN } from "../services/amazon.ts";
import { getLogger } from "../utils/logger.ts";

export const priceCommand = new Command()
  .option("-l, --limit [type:number]", "Limit to process", { default: 3 })
  .action(async ({ limit, verbose }) => {
    const spinner = wait("Loading data");
    if (!verbose) spinner.start();
    const store = getStore();
    const logger = getLogger(verbose);
    const books = Fae.take(limit ?? 3, unpricedBooks(store));

    for (const book of books) {
      const bookInfoText = `${book.isbn} ${book.title}`;
      spinner.text = `Pricing ${bookInfoText}`;
      logger.info(`${bookInfoText}: Pricing`);
      try {
        const am = await findByISBN(book.isbn);
        const priced = { ...book, ...am } as StoreRecord;
        logger.info(`${bookInfoText}: Found ${am.price}`);
        spinner.text = `Found ${am.price}`;
        store.override(book.isbn, priced);
      } catch (error) {
        logger.error(`${bookInfoText}: ${error}`);
      }
    }
    store.save();
    spinner.succeed("All done!");
  });
