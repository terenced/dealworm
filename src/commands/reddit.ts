import { Command } from "../deps/cliffy.ts";

import { printRecords } from "../utils/printer.ts";
import { Deal, getDeals } from "../services/reddit.ts";
import { OpenLibBook, searchBookDetails } from "../services/open-library.ts";

export const redditCommand = new Command()
  .action(async () => {
    const deals = await getDeals();

    let items: OpenLibBook[] = [];
    for (const deal of deals) {
      if (!deal.title) {
        continue;
      }
      console.log(deal.text);
      const details = await searchBookDetails(deal.title, deal.author);
      items.push({
        ...deal,
        ...details,
        priceStr: deal.text.match(/\$\d*\.\d*/),
      });
    }
    printRecords(items);
  });
