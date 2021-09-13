import isbn3 from "https://cdn.skypack.dev/isbn3";

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
  .option(
    "-i, --isbn [type:string]",
    "Find a specifc book by ISBN",
    (value: string) => isbn3.asIsbn13(value),
  )
  .option("--fetchOnly [type:boolean]", "Fetch only and print the info", {
    default: false,
  })
  .action(async ({ limit, verbose, all, isbn, fetchOnly }) => {
    if (fetchOnly) {
      await fetchISBNOnly(isbn);
    } else {
      await priceBooks(limit, all, isbn, verbose);
    }
  });

async function priceBooks(
  limit: number,
  all: boolean,
  isbn?: string,
  verbose?: boolean,
) {
  const spinner = verbose ? undefined : wait("Loading data");
  if (spinner) spinner.start();
  const store = getStore();
  const logger = getLogger(verbose);
  const items = isbn ? [store.get(isbn)] : orderedUnpricedBooks(store);
  limit = all ? items.length : limit;
  const books = Fae.take(limit, items);

  let current = 1;
  for (const book of books) {
    if (!book) continue;
    const bookInfoText = `(${current++}/${limit}) ${book.isbn} ${book.title}`;
    if (spinner) spinner.text = `Pricing ${bookInfoText}`;
    logger.info(`${bookInfoText}: Pricing`);
    try {
      const am = await findByISBN(book.isbn);
      const priced = {
        ...book,
        ...am,
        updated: Date.now(),
      } as StoreRecord;
      logger.info(`${bookInfoText}: Found ${am.price}`);
      if (spinner) spinner.text = `Found ${am.price}`;
      store.updateAndCommit(book.isbn, priced);
    } catch (error) {
      logger.info(`${bookInfoText}: encountered an error`);
      logger.error(`${bookInfoText}: ${error}`);
      store.updateAndCommit(book.isbn, {
        ...book,
        updated: Date.now(),
      });
    }
  }
  store.save();
  if (spinner) spinner.succeed("All done!");
}

async function fetchISBNOnly(isbn: string) {
  const item = await findByISBN(isbn);
  console.log(item);
}
