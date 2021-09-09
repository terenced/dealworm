import Denomander from "https://deno.land/x/denomander@0.9.0/mod.ts";
import chalkin from "https://deno.land/x/chalkin@v0.1.3/mod.ts";
import { badge } from "https://deno.land/x/cli_badges@v0.1.1/mod.ts";

import "https://deno.land/x/dotenv@v3.0.0/load.ts";

import { toBook } from "./models/mappers.ts";
import { getItemsFromFeed } from "./services/goodreads.ts";
import {
  allBooks,
  booksToPrice,
  getStore,
  pricedBooks,
  Record,
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
  app_name: "Blagh Jeade",
  app_description: "Blagh Jeade: Book finder in Old Tongue",
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
        if (store.get(book.isbn)) {
          skipped++;
        } else {
          store.set(book.isbn, book);
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
    console.log(chalkin.bold.green("Added"), added);
    console.log(chalkin.bold.green("Skipped"), skipped);
    console.log(chalkin.bold.green("Failed"), failed);
    store.save();
  });

program
  .command("list")
  .option("-a, --all", "All Items in store")
  .option("-p, --prices", "All items with price")
  .option("-m, --missing", "All items missing prices")
  .action(async () => {
    let items: Record[];
    if (program.missing) {
      printRecords(booksToPrice());
    } else if (program.prices) {
      printRecords(pricedBooks());
    } else {
      items = allBooks();
      console.log(items);
    }
  });

program
  .command("price")
  .action(async () => {
    const store = getStore();
    const books = booksToPrice(store);
    for (const book of books.splice(0, 3)) {
      console.log(book.isbn, book.title);
      const am = await findByISBN(book.isbn);
      store.set(book.isbn, { ...book, ...am });
    }
    store.save();
  });
program.parse(Deno.args);
