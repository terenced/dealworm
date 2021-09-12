import { Command } from "../deps/cliffy.ts";
import { chalkin } from "../deps/chalkin.ts";

import { CmdGlobalOptions } from "./cmd-options.ts";

import { getItemsFromFeed } from "../services/goodreads.ts";
import { getStore } from "../services/store.ts";
import { toBook } from "../models/mappers.ts";

interface SyncCommandOptions extends CmdGlobalOptions {
  failed?: boolean;
}

export const syncCommand = new Command()
  .description("")
  .arguments("[url?]")
  .option("-f, --failed", "Print books failed books due to missing ISBNs")
  .action(sync);

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

async function sync(options: SyncCommandOptions, url?: string) {
  const feedUrl = getFeedUrl(url);
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
      if (options.failed) {
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
}
