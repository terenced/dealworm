import Denomander from "https://deno.land/x/denomander@0.9.0/mod.ts";
import chalkin from "https://deno.land/x/chalkin@v0.1.3/mod.ts";
import "https://deno.land/x/dotenv@v3.0.0/load.ts";

import { getItemsFromFeed } from "./services/goodreads.ts";
import { Book, BookRecord } from "./models/book.ts";
import {
  allBooks,
  booksToPrice,
  getStore,
  pricedBooks,
} from "./services/store.ts";
import { findByISBN } from "./services/amazon.ts";

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
  .option("-m, --missing", "Print books missing ISBNs")
  .action(async () => {
    const feedUrl = getFeedUrl(program.url);
    const items = await getItemsFromFeed(feedUrl);
    const books = items.map(Book.fromGoodReadsFeedEntry);
    const store = await getStore();
    let added = 0;
    let skipped = 0;
    books.splice(0, 5).forEach((book) => {
      if (book.isbn) {
        store.set(book.isbn, book);
        added++;
      } else {
        skipped++;
        if (program.missing) {
          console.error(
            chalkin.red("Missing ISBN"),
            chalkin.bold(book.title),
            chalkin.dim(book.url),
          );
        }
      }
    });
    console.log("Added", added);
    console.log("Skipped", skipped);
    await store.save();
  });

program
  .command("list")
  .option("-a, --all", "All Items in store")
  .option("-p, --prices", "All items with price")
  .option("-m, --missing", "All items missing prices")
  .action(async () => {
    let items: BookRecord[];
    if (program.missing) {
      items = booksToPrice();
    } else if (program.prices) {
      items = pricedBooks();
    } else {
      items = allBooks();
    }
    console.log(items);
  });

program
  .command("price")
  .action(async () => {
    const store = getStore();
    for (const [isbn, book] of store.entries()) {
      console.log(isbn, book.title);
      // const am = await findByISBN(isbn);
      // store.set(isbn, { ...book, ...am });
    }
    await store.save();
  });
// program
//   .command("feed [url?]")
//   .option("-f, --fetch", "fetch price")
//   .option("-u, --unfiltered", "Do not filter items with ISBNs")
//   .option("-l, --limit", "fetch price", parseInt, 5)
//   .action(async () => {
//     const feedUrl = getFeedUrl(program.url);
//     const items = await getItemsFromFeed(feedUrl);
//     console.log(items.map(Book.fromGoodReadsFeedEntry));
//     // const records = items.map(toRecord);
//     // console.log(records[0]);
//     //     const items = options.fetch
//     //       ? await fetchPricesForFeed(feedUrl, options.limit)
//     //       : await getItemsFromFeed(feedUrl, options);
//     //
//     //     printItems(items);
//   });
program.parse(Deno.args);
