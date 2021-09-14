import puppeteer from "https://deno.land/x/puppeteer@9.0.1/mod.ts";
import { SearchResult, UNKNOWN_PRICE } from "../models/searchResult.ts";
import { parse } from "https://deno.land/x/cashify@v2.5.0/mod.ts";
import { sanitizeUrlString } from "../utils/url.ts";

const RESULT_SECTION_SELECTOR = "span[class*=SEARCH_RESULTS]";

const BASE_URL = "https://www.amazon.ca";

export const getAmazonSearchUrl = (isbn: string): string =>
  `${BASE_URL}/s?k=${isbn}&i=stripbooks`;

const getPrice = (priceStr: string | undefined) => {
  if (!priceStr || priceStr === "") {
    return UNKNOWN_PRICE;
  }
  return parse(priceStr).amount;
};
export const buildSearchResult = (item: Partial<SearchResult>) => {
  const price = getPrice(item.priceStr);
  const onSale = price > 0 && price <= 3.99;
  return {
    ...item,
    price,
    onSale,
    storeUrl: sanitizeUrlString(`${BASE_URL}${item.storeUrl}`),
  };
};

export async function findByISBN(isbn: string) {
  const searchUrl = getAmazonSearchUrl(isbn);
  const browser = await puppeteer.launch({
    headless: Deno.env.get("DEBUG") !== "1",
    product: "firefox",
  });

  try {
    const page = await browser.newPage();
    await page.goto(searchUrl);

    if (Deno.env.get("DEBUG")) {
      console.log(searchUrl);
      await page.screenshot({ path: `./debug-${isbn}.jpg`, type: "jpeg" });
    }
    await page.waitForSelector(RESULT_SECTION_SELECTOR);

    if (Deno.env.get("DEBUG")) {
      // @ts-ignore
      page.on("console", (msg) => console.log("PAGE >>>", msg._text));
    }

    const product = (
      await page.evaluate(() => {
        // [...document.querySelectorAll('div.a-row.a-size-base.a-color-secondary > span')].map(r=> r.textContent).filter(r => r.startsWith('Or')).pop()
        const getPrice = (elm: any | null) => {
          return elm?.querySelector(
            '.a-link-normal.a-text-normal > span[class="a-price"] > span[class="a-offscreen"]',
          )?.textContent || "";
        };
        // @ts-ignore
        const item = document.querySelector("span[class*=SEARCH_RESULTS]");
        const kindleItem = item.querySelector(
          'a.a-size-base.a-link-normal.a-text-normal[href*="ebook"]',
        );
        let price = getPrice(kindleItem);
        console.log("price", price);
        console.log("ki", kindleItem?.textContent);
        if (price === "$0.00") {
          // This might because the book is part of Kindle Unlimited.
          // Need to look deeper
          price = [
            // @ts-ignore
            ...document.querySelectorAll(
              "div.a-row.a-size-base.a-color-secondary > span",
            ),
          ].filter((r) => r.textContent.startsWith("Or"))
            .map((i) => i?.textContent?.match(/\$\d*\.\d*/)?.pop())
            .pop();

          console.log("new price", price);
        }
        return {
          storeName: item.querySelector("h2")?.innerText,
          priceStr: price,
          storeUrl: kindleItem?.getAttribute("href") || "",
          storeImg: item.querySelector(".s-image")?.getAttribute("src") || "",
        };
      })
    );

    await page.close();
    await browser.close();

    return buildSearchResult(product);
  } catch (error) {
    await browser.close();
    throw error;
  }
}
