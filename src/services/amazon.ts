import puppeteer from "https://deno.land/x/puppeteer@9.0.1/mod.ts";
import { SearchResult } from "../models/searchResult.ts";
import { parse } from "https://deno.land/x/cashify@v2.5.0/mod.ts";
import { sanitizeUrlString } from "../utils/url.ts";
const RESULT_SECTION_SELECTOR = "span[class*=SEARCH_RESULTS]";

const BASE_URL = "https://www.amazon.ca";

export const buildSearchResult = (item: Partial<SearchResult>) => {
  try {
    const price = parse(item.priceStr || "0").amount;
    const onSale = price > 0 && price <= 3.99;
    return {
      ...item,
      price,
      onSale,
      updated: Date.now(),
      storeUrl: sanitizeUrlString(`${BASE_URL}${item.storeUrl}`),
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export async function findByISBN(isbn: string) {
  // TODO: Move to config?
  const searchUrl = `${BASE_URL}/s?k=${isbn}&i=stripbooks`;
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
      page.on("console", (msg) => console.log("PAGE LOG:", msg._text));
    }
    const products = (
      await page.evaluate(() => {
        return Array.from(
          // @ts-ignore
          document.querySelectorAll("span[class*=SEARCH_RESULTS]"),
          // @ts-ignore
        ).map((item: Element) => {
          const kindleItem = item.querySelector(
            'a.a-size-base.a-link-normal.a-text-normal[href*="ebook"]',
          );
          return {
            storeName: item.querySelector("h2")?.innerText,
            priceStr: kindleItem?.querySelector(
              '.a-link-normal.a-text-normal > span[class="a-price"] > span[class="a-offscreen"]',
            )?.textContent || "",
            storeUrl: kindleItem?.getAttribute("href") || "",
            storeImg: item.querySelector(".s-image")?.getAttribute("src") || "",
          };
        });
      })
    ).map(buildSearchResult).filter((p) => p);

    await page.close();
    await browser.close();

    return products[0];
  } catch (error) {
    await browser.close();
    throw error;
  }
}
