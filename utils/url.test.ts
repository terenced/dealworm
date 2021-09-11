import {
  beforeEach,
  describe,
  expect,
  it,
  run,
} from "https://deno.land/x/tincan/mod.ts";

import {
  getGoodReadsUrlFromDescription,
  getUrls,
  sanitizeUrlString,
} from "./url.ts";

describe("getUrls", () => {
  it("should return urls", async () => {
    expect(
      getUrls(
        "boob blah <a href='https://www.example.com'></a> https://www.example.com/2",
      ),
    ).toEqual([
      "https://www.example.com",
      "https://www.example.com/2",
    ]);
  });
});

describe("getGoodReadsUrlFromDescription ", () => {
  it("extracts URL", async () => {
    const desc =
      '<a href="https://www.goodreads.com/book/show/55188449-the-desert-prince?utm_medium=api&amp;utm_source=rss"><img alt="The Desert Prince" src="https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1615255467l/55188449._SY75_.jpg" /></a><br/>';

    const url = getGoodReadsUrlFromDescription(desc);
    expect(url).toBe(
      "https://www.goodreads.com/book/show/55188449-the-desert-prince",
    );
  });
});

describe("sanitizeUrlString", () => {
  it("should clean things up", () => {
    const result = sanitizeUrlString(
      "https://www.example.com/foo/bar?shity_param=1&other_param=2",
    );
    expect(result).toBe("https://www.example.com/foo/bar");
  });
  it("handle undefined", () => {
    expect(sanitizeUrlString(undefined)).toBe("");
  });
});

run();
