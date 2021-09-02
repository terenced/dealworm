import Denomander from "https://deno.land/x/denomander/mod.ts";
import chalkin from "https://deno.land/x/chalkin/mod.ts";
import "https://deno.land/x/dotenv@v3.0.0/load.ts";

import { getItemsFromFeed } from "./services/goodreads.ts";
import { toRecord } from "./models/mappers.ts";

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
  .command("feed [url?]")
  .option("-f, --fetch", "fetch price")
  .option("-u, --unfiltered", "Do not filter items with ISBNs")
  .option("-l, --limit", "fetch price", parseInt, 5)
  .action(async () => {
    const feedUrl = getFeedUrl(program.url);
    const items = await getItemsFromFeed(feedUrl);
    console.log(items.map(toRecord));
    // const records = items.map(toRecord);
    // console.log(records[0]);
    //     const items = options.fetch
    //       ? await fetchPricesForFeed(feedUrl, options.limit)
    //       : await getItemsFromFeed(feedUrl, options);
    //
    //     printItems(items);
  });
program.parse(Deno.args);
