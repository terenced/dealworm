import puppeteer from "https://deno.land/x/puppeteer@9.0.1/mod.ts";

const RESULT_SECTION_SELECTOR = "span[class*=SEARCH_RESULTS]";

export async function findByISBN(isbn: string) {
  // TODO: Move to config?
  const baseUrl = "https://www.amazon.ca";
  const searchUrl = `${baseUrl}/s?k=${isbn}&i=stripbooks`;
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
            price: kindleItem?.querySelector(
              '.a-link-normal.a-text-normal > span[class="a-price"] > span[class="a-offscreen"]',
            )?.textContent || "",
            storeUrl: kindleItem?.getAttribute("href") || "",
            storeImg: item.querySelector(".s-image")?.getAttribute("src") || "",
          };
        });
      })
    ).map((item) => ({ ...item, storeUrl: `${baseUrl}${item.storeUrl}` })); //.map((product) => new Product({ ...product, isbn, baseUrl }));

    await page.close();
    await browser.close();

    return products[0];
  } catch (error) {
    await browser.close();
    throw error;
  }
}
