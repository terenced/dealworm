import { Command } from "cliffy/mod.ts";

import { printRecords } from "src/utils/printer.ts";
import { getDeals } from "src/services/reddit.ts";
import { OpenLibBook, searchBookDetails } from "src/services/open-library.ts";

export const redditCommand = new Command()
  .action(async () => {
    const deals = await getDeals();

    let items: OpenLibBook[] = [];
    for (const deal of deals) {
      if (!deal.title) {
        continue;
      }
      const details = await searchBookDetails(deal.title, deal.author);
      items.push({
        ...deal,
        ...details,
        priceStr: deal.text.match(/\$\d*\.\d*/),
      });
    }
    if (items.length === 0) {
      console.log("No deals found :(");
      return;
    }
    printRecords(items);
  });
