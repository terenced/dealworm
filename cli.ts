import { Denomander } from "./deps/denomander.ts";
import { chalkin } from "./deps/chalkin.ts";
import * as Fae from "./deps/fae.ts";

import "https://deno.land/x/dotenv@v3.0.0/load.ts";

import { toBook } from "./models/mappers.ts";
import { getItemsFromFeed } from "./services/goodreads.ts";
import {
  allBooks,
  getStore,
  pricedBooks,
  StoreRecord,
  unpricedBooks,
} from "./services/store.ts";
import { findByISBN } from "./services/amazon.ts";
import { printRecords } from "./utils/printer.ts";

const getFeedUrl = (url?: string) => {
  const feedUrl = url ?? Deno.env.get("GOODREADS_FEED");
  if (feedUrl) {
    console.log(`Using feed ${chalkin.dim(feedUrl)}`);
  } else {
    console.error("Feed url not provided");
    Deno.exit(1);
  }
  return feedUrl;
};

const program = new Denomander({
  app_name: "dealworm",
  app_description: "Find books on sale",
  app_version: "1.0.0",
});

program
  .command("sync [url?]")
  .option("-f, --failed", "Print books failed books due to missing ISBNs")
  .action(async () => {
    const feedUrl = getFeedUrl(program.url);
    const items = await getItemsFromFeed(feedUrl);
    const books = items.map(toBook);
    const store = getStore();

    let added = 0;
    let failed = 0;
    let skipped = 0;
    books.forEach((book) => {
      if (book.isbn) {
        if (store.has(book.isbn)) {
          skipped++;
        } else {
          store.add(book.isbn, book);
          added++;
        }
      } else {
        failed++;
        if (program.failed) {
          console.error(
            chalkin.red("No ISBN"),
            chalkin.bold(book.title),
            chalkin.dim(book.url),
          );
        }
      }
    });
    store.save();
    console.log(chalkin.bold.green("Added"), added);
    console.log(chalkin.bold.green("Skipped"), skipped);
    console.log(chalkin.bold.green("Failed"), failed);
  });

program
  .command("list")
  .option("-p, --prices", "All items with price")
  .option("-m, --missing", "All items missing prices")
  .option("-l, --limit", "Limit to process")
  .action(async () => {
    const store = getStore();
    let items: StoreRecord[];
    if (program.missing) {
      items = unpricedBooks(store);
    } else if (program.prices) {
      items = pricedBooks(store);
    } else {
      items = allBooks(store);
    }
    if (program.limit) {
      items = Fae.take(program.limit, items);
    }
    printRecords(items);
  });

program
  .command("price")
  .option("-l, --limit", "Limit to process")
  .action(async () => {
    const store = getStore();
    const books = Fae.take(program.limit ?? 3, unpricedBooks(store));
    for (const book of books) {
      console.log(book.isbn, book.title);
      const am = await findByISBN(book.isbn);
      const priced = { ...book, ...am } as StoreRecord;
      store.override(book.isbn, priced);
    }
    store.save();
  });

program.command("destory").action(() => getStore().destory());
program.parse(Deno.args);
