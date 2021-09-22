import isbn3 from "isbn3";

import { Command } from "cliffy/mod.ts";
import * as Fae from "fae";
import { wait } from "wait";

import { Book } from "src/models/book.ts";
import { getStore, outdatedBooks } from "src/services/store.ts";
import { findByISBN, getAmazonSearchUrl } from "src/services/amazon.ts";
import { getLogger } from "src/utils/logger.ts";

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
  const store = getStore();
  const logger = await getLogger(verbose);
  const items = isbn
    ? [store.get(isbn)]
    : all
    ? store.all()
    : outdatedBooks(store);
  limit = (all || isbn) ? items.length : limit;
  const books = Fae.take(limit, items);

  if (spinner) spinner.start();
  let current = 1;
  for (const book of books) {
    if (!book) continue;
    const bookInfoText = `(${current++}/${limit}) ${book.isbn} ${book.title}`;
    if (spinner) spinner.text = `Pricing ${bookInfoText}`;
    logger.info(`${book.isbn}: Pricing`, {
      book,
      url: getAmazonSearchUrl(book.isbn),
    });
    if (all) continue;
    try {
      const am = await findByISBN(book.isbn);
      const priced = {
        ...book,
        ...am,
        updated: Date.now(),
      } as Book;
      logger.info(`${book.isbn}: Found ${am.price}`, am);
      if (spinner) spinner.text = `Found ${am.price}`;
      store.updateAndCommit(book.isbn, priced);
    } catch (error) {
      logger.error(bookInfoText, { error });
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
